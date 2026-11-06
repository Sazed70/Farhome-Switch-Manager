import asyncio
from copy import deepcopy
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import Unauthorized
from custom_components.switch_manager.const import DOMAIN, CONF_STORE, CONF_BLUEPRINTS, CONF_MANAGED_SWITCHES
from custom_components.switch_manager.models import Blueprint, ManagedSwitchConfig
from custom_components.switch_manager.store import SwitchManagerStore
from custom_components.switch_manager.connections import async_setup_connections
from custom_components.switch_manager.farhome.store import FarhomeStore
from custom_components.switch_manager.farhome.config_service import (
    async_read_config, async_save_config, async_set_enabled,
    async_delete_config, async_duplicate_config,
)
from tests.fixtures import MemoryStorage


class ConfigurationTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        self.hass.loop.slow_callback_duration = 1.0
        self.metadata_disk = MemoryStorage()
        self.metadata = FarhomeStore(self.hass, storage=self.metadata_disk)
        await self.metadata.async_load()
        self.store = SwitchManagerStore(self.hass)
        await self.store.load()
        blueprint = Blueprint(self.hass, "synthetic", {"name": "Synthetic", "service": "Zigbee2MQTT", "event_type": "mqtt", "mqtt_topic_format": "zigbee2mqtt/+/action", "conditions": [], "buttons": [{"actions": [{"title": "single", "conditions": []}]}]}, False)
        self.hass.data[DOMAIN] = {CONF_STORE: self.store, CONF_BLUEPRINTS: {"synthetic": blueprint}, CONF_MANAGED_SWITCHES: {}, "farhome": self.metadata}
        registry = SimpleNamespace(async_get=lambda device_id: SimpleNamespace(id=device_id) if device_id == "device" else None)
        self.registry_patch = patch('custom_components.switch_manager.farhome.config_service.dr.async_get', return_value=registry)
        self.registry_patch.start()

    async def asyncTearDown(self):
        self.registry_patch.stop()
        for config in self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES].values():
            config.unload()
        await self.hass.async_stop(force=True)
        self.directory.cleanup()

    def draft(self):
        return {"id": None, "name": "Desk", "enabled": True, "identifier": "z2m/desk/action", "blueprint": "synthetic", "variables": {}, "rotate": 0, "buttons": [{"actions": [{"mode": "restart", "sequence": [], "loop": False, "loop_interval": 250}]}]}

    async def create(self, metadata=None):
        return await async_save_config(self.hass, self.draft(), metadata, None)

    async def legacy_handlers(self):
        handlers = {}
        def register(hass, command):
            handlers[command.__name__] = command
        with patch('custom_components.switch_manager.connections.websocket_api.async_register_command', register):
            await async_setup_connections(self.hass)
        return handlers

    async def call_legacy(self, handler, msg):
        results, errors = [], []
        connection = SimpleNamespace(user=SimpleNamespace(is_admin=True), send_result=lambda key, value: results.append(value), send_error=lambda *args: errors.append(args))
        handler(self.hass, connection, {"id": 4, **msg})
        # HA deliberately schedules WebSocket handlers as background tasks.
        await self.hass.async_block_till_done(wait_background_tasks=True)
        self.assertEqual(errors, [])
        self.assertEqual(len(results), 1)
        return results[0]

    async def test_two_new_configs_get_distinct_ids_and_start_disabled(self):
        a, b = await asyncio.gather(self.create(), self.create())
        self.assertNotEqual(a["config_id"], b["config_id"])
        self.assertFalse(a["config"]["enabled"])
        self.assertFalse(b["config"]["enabled"])
        self.assertEqual(len(self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES]), 2)

    async def test_stale_revision_rejected_after_legacy_save(self):
        initial = await self.create()
        handlers = await self.legacy_handlers()
        updated = self.draft()
        updated["id"] = initial["config_id"]
        updated["name"] = "Changed in original editor"
        await self.call_legacy(handlers['websocket_save_config'], {"config": updated, "fix_mismatch": False, "expected_revision": initial["revision"]})
        with self.assertRaisesRegex(ValueError, "conflict"):
            await async_save_config(self.hass, updated, None, initial["revision"])
        current = await async_read_config(self.hass, initial["config_id"])
        self.assertEqual(current["config"]["name"], "Changed in original editor")

    async def test_save_error_does_not_replace_runtime(self):
        initial = await self.create()
        old_runtime = self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES][initial["config_id"]]
        updated = self.draft()
        updated["id"] = initial["config_id"]
        updated["name"] = "Must not replace"
        with patch.object(self.store.store, 'async_save', AsyncMock(side_effect=OSError('disk full'))):
            with self.assertRaisesRegex(ValueError, "persistence_failed"):
                await async_save_config(self.hass, updated, None, initial["revision"])
        self.assertIs(self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES][initial["config_id"]], old_runtime)
        self.assertEqual(old_runtime.name, 'Desk')

    async def test_partial_metadata_failure_never_enables_new_config(self):
        self.metadata_disk.fail = True
        with self.assertRaisesRegex(ValueError, "persistence_failed|partial_write"):
            await self.create({"device_id": "device", "verified": True})
        self.assertFalse(any(config.enabled for config in self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES].values()))

    async def test_legacy_delete_cleans_binding(self):
        initial = await self.create({"device_id": "device", "verified": True})
        await self.metadata.async_update(self.metadata.revision, {"controllers": {"device": {"manual": True}}})
        current = await async_read_config(self.hass, initial['config_id'])
        handlers = await self.legacy_handlers()
        with patch('custom_components.switch_manager.connections.ir.async_delete_issue'):
            await self.call_legacy(handlers['websocket_delete_config'], {"config_id": initial['config_id'], "expected_revision": current['revision']})
        self.assertNotIn(initial['config_id'], self.metadata.snapshot()['bindings'])
        self.assertTrue(self.metadata.snapshot()['controllers']['device']['manual'])
        self.assertNotIn(initial['config_id'], self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES])

    async def test_duplicate_does_not_copy_physical_binding(self):
        initial = await self.create({"device_id": "device", "verified": True})
        copied = await async_duplicate_config(self.hass, initial['config_id'], initial['revision'])
        self.assertNotIn(copied['config_id'], self.metadata.snapshot()['bindings'])
        self.assertFalse(copied['config']['enabled'])
        self.assertEqual(copied['config']['identifier'], '')
        self.assertEqual(copied['config']['buttons'], initial['config']['buttons'])

    async def test_external_active_reference_blocks_activation(self):
        initial = await self.create({"device_id": "device", "verified": True})
        await self.metadata.async_update(self.metadata.revision, {"controllers": {"device": {"management": "external", "external_automations": ['automation.synthetic']}}})
        self.hass.states.async_set('automation.synthetic', 'on')
        current = await async_read_config(self.hass, initial['config_id'])
        with self.assertRaisesRegex(ValueError, "activation_blocked"):
            await async_set_enabled(self.hass, initial['config_id'], True, current['revision'], True)
        self.assertEqual(self.hass.states.get('automation.synthetic').state, 'on')
        self.assertFalse(self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES][initial['config_id']].enabled)

    async def test_missing_revision_cannot_overwrite_existing_config(self):
        initial = await self.create()
        updated = self.draft()
        updated['id'] = initial['config_id']
        with self.assertRaisesRegex(ValueError, 'conflict'):
            await async_save_config(self.hass, updated, None, None)

    async def test_disable_invalid_blueprint_still_stops_runtime(self):
        data = self.draft()
        data.update(id='9', blueprint='removed-blueprint', enabled=True)
        await self.store.async_write_config('9', data)
        with self.assertLogs('custom_components.switch_manager', level='ERROR'):
            broken = ManagedSwitchConfig(self.hass, 'removed-blueprint', '9', data)
        self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES]['9'] = broken
        current = await async_read_config(self.hass, '9')
        result = await async_set_enabled(self.hass, '9', False, current['revision'], False)
        self.assertFalse(result['config']['enabled'])
        self.assertFalse(broken.enabled)
        self.assertFalse(self.store.plain_data()['managed_switches']['9']['enabled'])

    async def test_metadata_rollback_failure_is_partial_without_activation(self):
        async def fail_config_save(data):
            self.metadata_disk.fail = True
            raise OSError('config disk failed after metadata write')
        with patch.object(self.store.store, 'async_save', fail_config_save):
            with self.assertRaisesRegex(ValueError, 'partial_write'):
                await self.create({'device_id': 'device', 'verified': True})
        self.assertEqual(self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES], {})

    async def test_config_failure_restores_only_own_metadata_binding(self):
        before = self.metadata.snapshot()
        with patch.object(self.store.store, 'async_save', AsyncMock(side_effect=OSError('config disk failed'))):
            with self.assertRaisesRegex(ValueError, 'persistence_failed'):
                await self.create({'device_id': 'device', 'verified': True})
        self.assertEqual(self.metadata.snapshot(), before)

    async def test_non_admin_denied(self):
        handlers = await self.legacy_handlers()
        for name in ('websocket_save_config', 'websocket_toggle_config_enabled', 'websocket_delete_config', 'websocket_duplicate_config'):
            with self.assertRaises(Unauthorized):
                handlers[name](self.hass, SimpleNamespace(user=SimpleNamespace(is_admin=False)), {'id': 1})

    async def test_quick_payload_is_checked_and_built_on_server(self):
        async def no_actuation(call):
            raise AssertionError('Editing must not execute services')
        self.hass.services.async_register('fan','increase_speed',no_actuation)
        self.hass.states.async_set('fan.air','off',{'supported_features':48})
        patch_value={'domain':'fan','kind':'increase','entity_id':'fan.air','step':10,'mode':'restart'}
        patches=[{'button':0,'action':0,'value':patch_value}]
        config=self.draft()
        with self.assertRaisesRegex(ValueError,'validation_error'):
            await async_save_config(self.hass,config,None,None,quick_actions=patches)
        self.assertEqual(self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES],{})
        self.hass.states.async_set('fan.air','off',{'supported_features':49})
        result=await async_save_config(self.hass,config,None,None,quick_actions=patches)
        self.assertEqual(result['config']['buttons'][0]['actions'][0]['sequence'],[{'action':'fan.increase_speed','target':{'entity_id':'fan.air'},'data':{'percentage_step':10}}])
        self.assertEqual(config['buttons'][0]['actions'][0]['sequence'],[])
        self.assertFalse(result['config']['enabled'])
