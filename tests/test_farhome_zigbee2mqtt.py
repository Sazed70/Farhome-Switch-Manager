import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from homeassistant.exceptions import HomeAssistantError
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
