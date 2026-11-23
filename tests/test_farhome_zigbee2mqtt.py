import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from homeassistant.exceptions import HomeAssistantError
from custom_components.switch_manager.const import DOMAIN
from custom_components.switch_manager.farhome.zigbee2mqtt import async_definitions


class ZigbeeMetadataTests(unittest.IsolatedAsyncioTestCase):
    async def test_retained_definitions_are_namespaced_and_subscriptions_cleaned(self):
        cleaned = []
        async def subscribe(hass, topic, callback):
            callback(SimpleNamespace(topic=topic, retain=True, payload='[{"ieee_address":"0xabc","friendly_name":"desk","definition":{"model":"ZG-101ZD"}}]'))
            return lambda: cleaned.append(topic)
        hass = SimpleNamespace(config=SimpleNamespace(components={"mqtt"}))
        with patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_discover_zigbee2mqtt_instances', AsyncMock(return_value=['first', 'home/second'])), patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_subscribe', subscribe):
            devices, warnings = await async_definitions(hass, timeout=.01)
        self.assertEqual({device['base_topic'] for device in devices}, {'first', 'home/second'})
        self.assertEqual(warnings, [])
        self.assertEqual(cleaned, ['first/bridge/devices', 'home/second/bridge/devices'])

    async def test_timeout_keeps_metadata_read_only_and_cleans_listeners(self):
        cleaned = []
        async def subscribe(hass, topic, callback):
            callback(SimpleNamespace(topic=topic, retain=False, payload='[{"ieee_address":"0xabc","friendly_name":"desk","definition":{}}]'))
            return lambda: cleaned.append(topic)
        hass = SimpleNamespace(config=SimpleNamespace(components={"mqtt"}))
        with patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_discover_zigbee2mqtt_instances', AsyncMock(return_value=['first'])), patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_subscribe', subscribe):
            devices, warnings = await async_definitions(hass, timeout=.01)
        self.assertEqual(devices, [])
        self.assertIn('zigbee2mqtt_definitions_timeout', warnings)
        self.assertEqual(cleaned, ['first/bridge/devices'])

    async def test_subscribe_error_releases_prior_listener(self):
        cleaned = []
        async def subscribe(hass, topic, callback):
            if topic.startswith('second/'):
                raise HomeAssistantError('synthetic transport failure')
            return lambda: cleaned.append(topic)
        hass = SimpleNamespace(config=SimpleNamespace(components={"mqtt"}))
        with patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_discover_zigbee2mqtt_instances', AsyncMock(return_value=['first', 'second'])), patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_subscribe', subscribe):
            devices, warnings = await async_definitions(hass, timeout=.01)
        self.assertEqual(devices, [])
        self.assertEqual(warnings, ['mqtt_unavailable'])
        self.assertEqual(cleaned, ['first/bridge/devices'])

    async def test_definitions_cache_successful_reads_and_skips_timeout_warnings(self):
        calls = 0

        async def subscribe(hass, topic, callback):
            nonlocal calls
            calls += 1
            if getattr(self, "send_retained", True):
                callback(SimpleNamespace(topic=topic, retain=True, payload='[{"ieee_address":"0xabc","friendly_name":"desk","definition":{"model":"ZG-101ZD"}}]'))
            return lambda: None

        hass = SimpleNamespace(config=SimpleNamespace(components={"mqtt"}), data={DOMAIN: {}})
        with patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_discover_zigbee2mqtt_instances', AsyncMock(return_value=['first'])), patch('custom_components.switch_manager.farhome.zigbee2mqtt.async_subscribe', subscribe):
            self.send_retained = False
            _, warnings = await async_definitions(hass, timeout=.01)
            self.assertEqual(warnings, ['zigbee2mqtt_definitions_timeout'])
            self.assertNotIn('farhome_z2m_cache', hass.data[DOMAIN])
            self.send_retained = True
            first, _ = await async_definitions(hass, timeout=.01)
            second, warnings2 = await async_definitions(hass, timeout=.01)
        self.assertEqual(calls, 2)
        self.assertEqual(first, second)
        self.assertEqual(warnings2, [])
