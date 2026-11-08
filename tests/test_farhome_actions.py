import tempfile
import unittest
from homeassistant.core import HomeAssistant
from homeassistant.components.fan.const import FanEntityFeature
from custom_components.switch_manager.farhome.actions import validate_quick_action


class QuickActionValidationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        async def no_actuation(call):
            raise AssertionError('Configuration must not actuate devices')
        for domain, names in {'light':['toggle','turn_on','turn_off'],'fan':['toggle','turn_on','turn_off','increase_speed','decrease_speed'],'switch':['toggle','turn_on','turn_off'],'scene':['turn_on'],'script':['turn_on']}.items():
            for name in names:
                self.hass.services.async_register(domain,name,no_actuation)
        self.hass.states.async_set('fan.air','off',{'supported_features':49})
        self.hass.states.async_set('fan.fixed','on',{'supported_features':48})
        self.hass.states.async_set('light.desk','unavailable',{'supported_color_modes':['color_temp'],'supported_features':32,'min_color_temp_kelvin':2000,'max_color_temp_kelvin':6500})

    async def asyncTearDown(self):
        await self.hass.async_stop(force=True)
        self.directory.cleanup()

    def test_backend_builds_fan_speed_without_executing_service(self):
        result=validate_quick_action(self.hass,{'domain':'fan','kind':'increase','entity_id':'fan.air','step':10,'mode':'restart'})
        self.assertEqual(result,{'mode':'restart','sequence':[{'action':'fan.increase_speed','target':{'entity_id':'fan.air'},'data':{'percentage_step':10}}]})

    def test_real_feature_enum_is_supported(self):
        self.hass.states.async_set('fan.air','off',{'supported_features':FanEntityFeature.SET_SPEED|FanEntityFeature.TURN_ON|FanEntityFeature.TURN_OFF})
        result=validate_quick_action(self.hass,{'domain':'fan','kind':'increase','entity_id':'fan.air','step':10,'mode':'single'})
        self.assertEqual(result['sequence'][0]['action'],'fan.increase_speed')

    def test_backend_rejects_speed_without_device_capability(self):
        with self.assertRaisesRegex(ValueError,'unsupported_speed'):
            validate_quick_action(self.hass,{'domain':'fan','kind':'increase','entity_id':'fan.fixed','step':10,'mode':'single'})

    def test_missing_target_and_cross_domain_parameters_rejected(self):
        with self.assertRaisesRegex(ValueError,'unknown_target'):
            validate_quick_action(self.hass,{'domain':'fan','kind':'on','entity_id':'fan.removed','mode':'single'})
        with self.assertRaises(ValueError):
            validate_quick_action(self.hass,{'domain':'fan','kind':'on','entity_id':'fan.air','brightness_pct':50,'mode':'single'})

    def test_unavailable_light_preserves_target_and_kelvin(self):
        result=validate_quick_action(self.hass,{'domain':'light','kind':'on','entity_id':'light.desk','brightness_pct':100,'color_temp_kelvin':5609,'transition':.1,'mode':'restart','loop':False,'loop_interval':250})
        self.assertEqual(result['sequence'][0]['target']['entity_id'],'light.desk')
        self.assertEqual(result['sequence'][0]['data'],{'brightness_pct':100,'color_temp_kelvin':5609,'transition':.1})
        self.assertEqual(result['loop_interval'],250)

    def test_target_color_temperature_bounds_are_checked(self):
        with self.assertRaises(ValueError):
            validate_quick_action(self.hass,{'domain':'light','kind':'on','entity_id':'light.desk','color_temp_kelvin':9000,'mode':'single'})

    def test_rgb_is_saved_only_for_color_capable_lights_and_without_kelvin(self):
        self.hass.states.async_set('light.color', 'on', {'supported_color_modes': ['xy', 'color_temp']})
        quick = {'domain': 'light', 'kind': 'toggle', 'mode': 'single', 'entity_id': 'light.color', 'rgb_color': [51, 170, 102], 'brightness_pct': 62.5}
        self.assertEqual(validate_quick_action(self.hass, quick)['sequence'][0]['data'],
                         {'rgb_color': [51, 170, 102], 'brightness_pct': 62.5})
        with self.assertRaisesRegex(ValueError, 'invalid_quick_parameters'):
            validate_quick_action(self.hass, {**quick, 'color_temp_kelvin': 3400})
        with self.assertRaisesRegex(ValueError, 'unsupported_color'):
            validate_quick_action(self.hass, {**quick, 'entity_id': 'light.desk'})
        for rgb in ([0, 0], [0, True, 0], [0, 0, 256], [0, 1.5, 0], '{{ colors }}'):
            with self.subTest(rgb=rgb), self.assertRaisesRegex(ValueError, 'invalid_parameter'):
                validate_quick_action(self.hass, {**quick, 'rgb_color': rgb})

    def test_invalid_numbers_and_unsupported_service_rejected(self):
        for step in (True,0,-10,101,float('inf')):
            with self.subTest(step=step),self.assertRaises(ValueError):
                validate_quick_action(self.hass,{'domain':'fan','kind':'increase','entity_id':'fan.air','step':step,'mode':'single'})
        self.hass.services.async_remove('fan','increase_speed')
        with self.assertRaisesRegex(ValueError,'unknown_service'):
            validate_quick_action(self.hass,{'domain':'fan','kind':'increase','entity_id':'fan.air','step':10,'mode':'single'})

    def test_area_target_supported_for_light_fan_switch(self):
        from unittest.mock import patch, MagicMock
        mock_ar = MagicMock()
        mock_ar.async_get_area.side_effect = lambda aid: MagicMock(id=aid) if aid == 'camera_ilario' else None
        with patch('homeassistant.helpers.area_registry.async_get', return_value=mock_ar):
            res = validate_quick_action(self.hass, {'domain': 'light', 'kind': 'toggle', 'area_id': 'camera_ilario', 'mode': 'single'})
            self.assertEqual(res, {'mode': 'single', 'sequence': [{'action': 'light.toggle', 'target': {'area_id': 'camera_ilario'}}]})
            with self.assertRaisesRegex(ValueError, 'unknown_target'):
                validate_quick_action(self.hass, {'domain': 'light', 'kind': 'toggle', 'area_id': 'non_existent_room', 'mode': 'single'})
            with self.assertRaisesRegex(ValueError, 'unsupported_area_action'):
                validate_quick_action(self.hass, {'domain': 'light', 'kind': 'increase', 'area_id': 'camera_ilario', 'mode': 'single', 'step': 10})
            with self.assertRaisesRegex(ValueError, 'invalid_quick_action'):
                validate_quick_action(self.hass, {'domain': 'light', 'kind': 'toggle', 'area_id': 'camera_ilario', 'entity_id': 'light.desk', 'mode': 'single'})
            with self.assertRaisesRegex(ValueError, 'invalid_quick_parameters'):
                validate_quick_action(self.hass, {'domain': 'fan', 'kind': 'on', 'area_id': 'camera_ilario', 'percentage': 50})
