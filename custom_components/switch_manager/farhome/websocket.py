"""Administrative transport; no device actuation routes are exposed here."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.helpers import device_registry as dr

from ..const import DOMAIN, CONF_MANAGED_SWITCHES
from .inventory import async_snapshot
from .config_service import async_read_config, async_save_config, async_set_enabled, FarhomeError


async def async_reply(connection, msg, operation):
    try:
        result = await operation
    except FarhomeError as err:
        connection.send_error(msg['id'], err.code, str(err))
        return
    connection.send_result(msg['id'], result)


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "switch_manager/farhome/snapshot"})
@websocket_api.async_response
async def websocket_snapshot(hass, connection, msg):
    await async_reply(connection, msg, async_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "switch_manager/farhome/metadata/save", vol.Required("expected_revision"): str, vol.Required("patch"): dict})
@websocket_api.async_response
async def websocket_metadata(hass, connection, msg):
    store = hass.data[DOMAIN]["farhome"]
    try:
        async with store.config_lock:
            candidate = store.patched(msg["patch"])
            registry = dr.async_get(hass)
            for key, value in msg["patch"].get("controllers", {}).items():
                if value is not None and registry.async_get(key) is None:
                    raise ValueError("unknown_device")
            for key, value in msg["patch"].get("bindings", {}).items():
                if value is not None and (key not in hass.data[DOMAIN][CONF_MANAGED_SWITCHES] or registry.async_get(value["device_id"]) is None):
                    raise ValueError("unknown_config_or_device")
            await store.async_update(msg["expected_revision"], msg["patch"])
    except ValueError as err:
        code = "conflict" if str(err) == "conflict" else "validation_error"
        connection.send_error(msg["id"], code, str(err))
        return
    except OSError:
        connection.send_error(msg["id"], "persistence_failed", "Impossibile salvare le associazioni. La modifica non è stata applicata.")
        return
    connection.send_result(msg["id"], {"revision": store.revision, "metadata": candidate})


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required('type'): 'switch_manager/farhome/config/get', vol.Required('config_id'): str})
@websocket_api.async_response
async def websocket_get_config(hass, connection, msg):
    await async_reply(connection, msg, async_read_config(hass, msg['config_id']))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required('type'): 'switch_manager/farhome/config/save', vol.Required('config'): dict, vol.Optional('metadata'): vol.Any(dict, None), vol.Optional('expected_revision'): vol.Any(str, None)})
@websocket_api.async_response
async def websocket_save_config(hass, connection, msg):
    await async_reply(connection, msg, async_save_config(hass, msg['config'], msg.get('metadata'), msg.get('expected_revision')))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required('type'): 'switch_manager/farhome/config/enabled', vol.Required('config_id'): str, vol.Required('enabled'): bool, vol.Required('expected_revision'): str, vol.Optional('conflict_check', default=False): bool})
@websocket_api.async_response
async def websocket_enabled(hass, connection, msg):
    await async_reply(connection, msg, async_set_enabled(hass, msg['config_id'], msg['enabled'], msg['expected_revision'], msg['conflict_check']))


async def async_setup_websocket(hass):
    if hass.data[DOMAIN].get("farhome_websocket_registered"):
        return
    for command in (websocket_snapshot, websocket_metadata, websocket_get_config, websocket_save_config, websocket_enabled):
        websocket_api.async_register_command(hass, command)
    hass.data[DOMAIN]["farhome_websocket_registered"] = True
