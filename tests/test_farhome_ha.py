import json
import tempfile
import unittest
from types import SimpleNamespace

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import Unauthorized
from custom_components.switch_manager.models import Blueprint
from custom_components.switch_manager.farhome.store import FarhomeStore
from custom_components.switch_manager.farhome.types import config_snapshot, revision
from custom_components.switch_manager.farhome.websocket import websocket_snapshot, websocket_metadata


class HomeAssistantBoundaryTests(unittest.IsolatedAsyncioTestCase):
    async def test_real_homeassistant_storage_survives_reload(self):
        with tempfile.TemporaryDirectory() as path:
            hass = HomeAssistant(path)
            try:
                store = FarhomeStore(hass)
                await store.async_load()
                await store.async_update(store.revision, {"controllers": {"synthetic": {"manual": True}}})
                reloaded = FarhomeStore(hass)
                await reloaded.async_load()
                self.assertTrue(reloaded.snapshot()["controllers"]["synthetic"]["manual"])
            finally:
                await hass.async_stop(force=True)

    async def test_real_blueprint_snapshot_is_plain_json(self):
        with tempfile.TemporaryDirectory() as path:
            hass = HomeAssistant(path)
            blueprint = Blueprint(hass, "synthetic", {"name": "Synthetic", "service": "Zigbee2MQTT", "event_type": "mqtt", "mqtt_topic_format": "zigbee2mqtt/+/action", "conditions": [], "buttons": [{"actions": [{"title": "single", "conditions": []}]}]}, False)
            config = SimpleNamespace(id="0", name="Synthetic", enabled=False, identifier="z2m/desk/action", rotate=0, variables=None, blueprint=blueprint, valid_blueprint=True, is_mismatch=False, _error=None, buttons=[])
            try:
                data = config_snapshot(config)
                self.assertEqual(json.loads(json.dumps(data))["blueprint"]["buttons"][0]["actions"][0]["title"], "single")
                self.assertEqual(len(revision(data)), 64)
            finally:
                await hass.async_stop(force=True)

    async def test_non_admin_denied_before_registry_or_storage_access(self):
        for handler in (websocket_snapshot, websocket_metadata):
            errors = []
            connection = SimpleNamespace(user=SimpleNamespace(is_admin=False), send_error=lambda *args: errors.append(args))
            with self.assertRaises(Unauthorized):
                handler(SimpleNamespace(), connection, {"id": 7, "type": "synthetic"})
            self.assertEqual(errors, [])
