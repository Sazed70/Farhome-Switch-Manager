import json
import tempfile
import unittest
from types import SimpleNamespace

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import Unauthorized

from custom_components.switch_manager.farhome.store import FarhomeStore
from custom_components.switch_manager.farhome.types import config_snapshot, revision
from custom_components.switch_manager.farhome.websocket import (
    websocket_metadata,
    websocket_snapshot,
)
from custom_components.switch_manager.models import Blueprint


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
            connection = SimpleNamespace(user=SimpleNamespace(is_admin=False), send_error=lambda *args, _errors=errors: _errors.append(args))
            with self.assertRaises(Unauthorized):
                handler(SimpleNamespace(), connection, {"id": 7, "type": "synthetic"})
            self.assertEqual(errors, [])

    async def test_unload_and_setup_entry_restores_switches(self):
        from unittest.mock import AsyncMock, patch

        from custom_components.switch_manager import (
            async_setup_entry,
            async_unload_entry,
        )
        from custom_components.switch_manager.const import (
            CONF_MANAGED_SWITCHES,
            CONF_STORE,
            DOMAIN,
        )

        with tempfile.TemporaryDirectory() as path:
            hass = HomeAssistant(path)
            try:
                fake_switch = SimpleNamespace(unload=lambda: None)
                hass.data[DOMAIN] = {
                    CONF_STORE: SimpleNamespace(get_managed_switches=AsyncMock(return_value={})),
                    CONF_MANAGED_SWITCHES: {"0": fake_switch},
                    "farhome": FarhomeStore(hass),
                }
                with patch("custom_components.switch_manager.async_remove_view"), patch(
                    "custom_components.switch_manager.async_setup_view", AsyncMock()
                ), patch("custom_components.switch_manager.async_setup_connections", AsyncMock()), patch(
                    "custom_components.switch_manager.async_setup_farhome_websocket", AsyncMock()
                ), patch("custom_components.switch_manager._init_switch_configs", AsyncMock()) as init_mock:
                    self.assertTrue(await async_unload_entry(hass, SimpleNamespace()))
                    self.assertEqual(hass.data[DOMAIN][CONF_MANAGED_SWITCHES], {})
                    self.assertTrue(await async_setup_entry(hass, SimpleNamespace()))
                    init_mock.assert_awaited_once_with(hass)
            finally:
                await hass.async_stop(force=True)

    async def test_z2m_discovery_debounces_early_and_event_entity_skips_other_devices(self):
        import time
        from unittest.mock import patch

        from custom_components.switch_manager.models import (
            async_discover_zigbee2mqtt_instances,
            format_event_entity_state,
        )

        async def fake_subscribe(hass, topic, callback):
            if topic.startswith("+/bridge"):
                callback(SimpleNamespace(topic="z2m/bridge/state"))
            return lambda: None

        start = time.monotonic()
        with patch("custom_components.switch_manager.models.mqtt_subscribe", fake_subscribe):
            found = await async_discover_zigbee2mqtt_instances(SimpleNamespace(), timeout=1.5, quiet=0.05)
        self.assertEqual(found, ["z2m"])
        self.assertLess(time.monotonic() - start, 0.5)

        fake_er = SimpleNamespace(
            async_get=lambda entity_id: SimpleNamespace(device_id="other_device"),
            async_entries_for_device=lambda *args, **kwargs: (_ for _ in ()).throw(AssertionError("must not enumerate siblings")),
        )
        event = SimpleNamespace(data={
            "new_state": SimpleNamespace(entity_id="event.button", state="2026-11-23T00:00:00+00:00", attributes={"event_type": "press"}),
            "old_state": SimpleNamespace(entity_id="event.button", state="2026-11-22T00:00:00+00:00", attributes={}),
        })
        with patch("custom_components.switch_manager.models.er.async_get", return_value=fake_er):
            self.assertIsNone(format_event_entity_state(SimpleNamespace(), event, expected_device_id="my_device"))
