"""Administrative transport; no device actuation routes are exposed here."""
from __future__ import annotations

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.helpers import device_registry as dr

from ..const import DOMAIN, CONF_MANAGED_SWITCHES
from .inventory import async_snapshot


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "switch_manager/farhome/snapshot"})
@websocket_api.async_response
async def websocket_snapshot(hass, connection, msg):
    connection.send_result(msg["id"], await async_snapshot(hass))


@websocket_api.require_admin
@websocket_api.websocket_command({vol.Required("type"): "switch_manager/farhome/metadata/save", vol.Required("expected_revision"): str, vol.Required("patch"): dict})
@websocket_api.async_response
async def websocket_metadata(hass, connection, msg):
    store = hass.data[DOMAIN]["farhome"]
    try:
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


async def async_setup_websocket(hass):
    if hass.data[DOMAIN].get("farhome_websocket_registered"):
        return
    for command in (websocket_snapshot, websocket_metadata):
        websocket_api.async_register_command(hass, command)
    hass.data[DOMAIN]["farhome_websocket_registered"] = True
