# Farhome modifications 2026-11-06: coordinate writes and revisions with the new panel.
from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.websocket_api import event_message
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import issue_registry as ir
from homeassistant.helpers.script import Script

from .const import CONF_BLUEPRINTS, CONF_MANAGED_SWITCHES, DOMAIN
from .farhome.config_service import (
    async_delete_config,
    async_duplicate_config,
    async_read_all_configs,
    async_read_config,
    async_save_config,
    async_set_enabled,
)
from .farhome.websocket import async_reply
from .helpers import _get_blueprint, _get_switch_config
from .models import Blueprint, async_discover_zigbee2mqtt_instances
from .schema import SWITCH_MANAGER_CONFIG_SCHEMA


async def async_setup_connections( hass ):
  
    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/blueprints", 
        vol.Optional("blueprint_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_blueprints(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        data = ({ "blueprint": _get_blueprint(hass, msg['blueprint_id'] ) } 
                if msg.get('blueprint_id')
                else { "blueprints": hass.data[DOMAIN].get(CONF_BLUEPRINTS) })

        connection.send_result( msg["id"], data )

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/blueprints/auto_discovery", 
        vol.Required("blueprint_id"): cv.string,
        # Zigbee2MQTT base topics to listen on instead of the blueprint default
        vol.Optional("base_topics"): [cv.string]
    })
    @websocket_api.async_response
    async def websocket_blueprint_auto_discovery(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        blueprint = _get_blueprint(hass, msg['blueprint_id'])
        if not isinstance(blueprint, Blueprint):
            connection.send_error(msg["id"], "not_found", f"Blueprint {msg['blueprint_id']} not found")
            return

        @callback
        def send( data ):
            connection.send_message(event_message(msg["id"], data))

        discovery_listener = await blueprint.start_discovery(send, msg.get('base_topics'))
        if not discovery_listener:
            connection.send_error(msg["id"], "discovery_unavailable", "Unable to start blueprint auto discovery")
            return

        @callback
        def close_connection():
            discovery_listener()
        
        connection.subscriptions[msg["id"]] = close_connection
        connection.send_result(msg["id"])

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/zigbee2mqtt/instances"
    })
    @websocket_api.async_response
    async def websocket_zigbee2mqtt_instances(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        """List the base topics of all Zigbee2MQTT instances seen on the broker."""
        instances = await async_discover_zigbee2mqtt_instances(hass)
        connection.send_result(msg["id"], { "instances": instances })

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/configs", 
        vol.Optional("config_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_configs(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        if msg.get('config_id'):
            await async_reply(connection, msg, async_read_config(hass, msg['config_id']))
        else:
            await async_reply(connection, msg, async_read_all_configs(hass))

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/config/monitor", 
        vol.Required("config_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_monitor_config(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        config = _get_switch_config( hass, msg['config_id'] )
        if config is None:
            connection.send_error(msg["id"], "not_found", f"Switch id {msg['config_id']} does not exist")
            return

        @callback
        def send( data ):
            connection.send_message(event_message(msg["id"], data))

        config_listener = config.add_listener(send)

        @callback
        def close_connection():
            config_listener()
        
        connection.subscriptions[msg["id"]] = close_connection
        connection.send_result(msg["id"])

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/config/save",
        vol.Optional('expected_revision'): vol.Any(str, None),
        vol.Required('config'): SWITCH_MANAGER_CONFIG_SCHEMA,
        vol.Optional('fix_mismatch', default=False): bool
    })
    @websocket_api.async_response
    async def websocket_save_config(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        async def save():
            result = await async_save_config(hass, msg['config'], None, msg.get('expected_revision'), fix_mismatch=msg.get('fix_mismatch', False))
            if msg.get('fix_mismatch'):
                ir.async_delete_issue(hass, DOMAIN, f"switch_{result['config_id']}_mismatch")
            return result
        await async_reply(connection, msg, save())

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/config/enabled",
        vol.Optional('expected_revision'): vol.Any(str, None),
        vol.Optional('conflict_check', default=False): bool,
        vol.Required("config_id"): cv.string,
        vol.Required("enabled"): bool
    })
    @websocket_api.async_response
    async def websocket_toggle_config_enabled(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        async def toggle():
            result = await async_set_enabled(hass, msg['config_id'], msg['enabled'], msg.get('expected_revision'), msg.get('conflict_check', False))
            return {**result, 'switch_id': result['config_id'], 'enabled': result['config']['enabled']}
        await async_reply(connection, msg, toggle())

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/config/delete",
        vol.Optional('expected_revision'): vol.Any(str, None),
        vol.Required("config_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_delete_config(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        async def delete():
            result = await async_delete_config(hass, msg['config_id'], msg.get('expected_revision'))
            ir.async_delete_issue(hass, DOMAIN, f"switch_{msg['config_id']}_mismatch")
            return result
        await async_reply(connection, msg, delete())

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/config/duplicate",
        vol.Optional('expected_revision'): vol.Any(str, None),
        vol.Required("config_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_duplicate_config(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        await async_reply(connection, msg, async_duplicate_config(hass, msg['config_id'], msg.get('expected_revision')))

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/copy_from_list",
        vol.Required("blueprint_id"): cv.string,
        vol.Optional("skip_config_id"): cv.string
    })
    @websocket_api.async_response
    async def websocket_copy_from_list(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        if 'skip_config_id' not in msg:
            msg['skip_config_id'] = ''
        data = [
            s for s in hass.data[DOMAIN][CONF_MANAGED_SWITCHES].values()
            if s.valid_blueprint and s.blueprint.id == msg['blueprint_id'] and s.id != msg['skip_config_id']
        ]

        connection.send_result( msg['id'], {
            "switches": data
        })

    @websocket_api.require_admin
    @websocket_api.websocket_command({
        vol.Required("type"): "switch_manager/run_action",
        vol.Required("action"): dict,
    })
    @websocket_api.async_response
    async def websocket_run_action(
        hass: HomeAssistant,
        connection: websocket_api.ActiveConnection,
        msg: dict[str, Any],
    ) -> None:
        action_data = dict(msg["action"])
        action_data.pop("metadata", None)
        script_obj = None
        try:
            sequence = cv.SCRIPT_SCHEMA(action_data)
            script_obj = Script(hass, sequence, "Switch Manager Run Action", DOMAIN)
            await script_obj.async_run(context=connection.context(msg))
        except Exception as err:  # noqa: BLE001
            connection.send_error(msg["id"], "action_failed", str(err))
            return
        finally:
            if script_obj is not None and hasattr(script_obj, "async_unload"):
                await script_obj.async_unload()
        connection.send_result(msg["id"])

    websocket_api.async_register_command(hass, websocket_run_action)
    websocket_api.async_register_command(hass, websocket_configs)
    websocket_api.async_register_command(hass, websocket_blueprints)
    websocket_api.async_register_command(hass, websocket_blueprint_auto_discovery)
    websocket_api.async_register_command(hass, websocket_zigbee2mqtt_instances)
    websocket_api.async_register_command(hass, websocket_monitor_config)
    websocket_api.async_register_command(hass, websocket_save_config)
    websocket_api.async_register_command(hass, websocket_toggle_config_enabled)
    websocket_api.async_register_command(hass, websocket_delete_config)
    websocket_api.async_register_command(hass, websocket_duplicate_config)
    websocket_api.async_register_command(hass, websocket_copy_from_list)