"""Read-only Zigbee2MQTT definitions and image provenance."""
from __future__ import annotations

import asyncio
import json
import re
from urllib.parse import quote, urlsplit

from homeassistant.components.mqtt import async_subscribe
from homeassistant.core import callback
from homeassistant.exceptions import HomeAssistantError

from ..models import async_discover_zigbee2mqtt_instances

MAX_BYTES = 2_000_000
MAX_DEVICES = 5000


def parse_devices(payload, base_topic):
    if not isinstance(payload, (str, bytes)) or len(payload) > MAX_BYTES:
        return []
    try:
        data = json.loads(payload)
    except (ValueError, UnicodeError):
        return []
    if not isinstance(data, list) or len(data) > MAX_DEVICES:
        return []
    return [{**item, "ieee_address": item["ieee_address"].lower(), "base_topic": base_topic}
            for item in data if isinstance(item, dict)
            and isinstance(item.get("ieee_address"), str)
            and re.fullmatch(r"0x[0-9a-fA-F]+", item["ieee_address"])
            and isinstance(item.get("friendly_name"), str)
            and isinstance(item.get("definition"), dict)]


def _model_name(value):
    if not isinstance(value, str) or not re.fullmatch(r"[\w .()+/\-]{1,180}", value) or ".." in value:
        return None
    return quote(value.replace("/", "_"), safe="._-()")


def resolve_image(definition, blueprint, custom_icon=None):
    model = _model_name((definition or {}).get("model"))
    source = f"https://www.zigbee2mqtt.io/devices/{model}.html" if model else None
    if isinstance(custom_icon, str) and len(custom_icon) <= 2048:
        try:
            url = urlsplit(custom_icon)
            if url.scheme == "https" and url.hostname and not url.username and not url.password:
                return {"url": custom_icon, "source_url": source or custom_icon, "source_label": "Zigbee2MQTT · personalizzata"}
        except ValueError:
            pass
    if model:
        return {"url": f"https://www.zigbee2mqtt.io/images/devices/{model}.png", "source_url": source, "source_label": "Zigbee2MQTT"}
    key = (blueprint or {}).get("id", "")
    if (blueprint or {}).get("has_image") and isinstance(key, str) and re.fullmatch(r"[\w-]+", key):
        return {"url": f"/assets/switch_manager/{key}.png", "source_url": "https://github.com/macpit/Home-Assistant-Switch-Manager", "source_label": "Switch Manager"}
    return None


def action_values(definition):
    values = set()
    pending = list((definition or {}).get("exposes") or [])
    while pending:
        item = pending.pop()
        if not isinstance(item, dict):
            continue
        if item.get("property") == "action" and isinstance(item.get("values"), list):
            values.update(value for value in item["values"] if isinstance(value, str))
        pending.extend(item.get("features") or [])
    return values


def has_actions(definition):
    return bool(action_values(definition))


async def async_definitions(hass, timeout=1.5):
    """Subscribe only to retained bridge metadata; never emit MQTT commands."""
    warnings = []
    if "mqtt" not in hass.config.components:
        return [], ["mqtt_unavailable"]
    topics = await async_discover_zigbee2mqtt_instances(hass, timeout)
    if not topics:
        return [], ["zigbee2mqtt_not_discovered"]
    received = {}
    finished = asyncio.Event()
    unsubscribers = []

    @callback
    def receive(message):
        if not message.retain:
            return
        base = message.topic.removesuffix("/bridge/devices")
        received[base] = parse_devices(message.payload, base)
        if len(received) == len(topics):
            finished.set()

    try:
        for base in topics:
            unsubscribers.append(await async_subscribe(hass, f"{base}/bridge/devices", receive))
        try:
            await asyncio.wait_for(finished.wait(), timeout)
        except TimeoutError:
            warnings.append("zigbee2mqtt_definitions_timeout")
    except HomeAssistantError:
        warnings.append("mqtt_unavailable")
    finally:
        for unsubscribe in unsubscribers:
            unsubscribe()
    return [device for group in received.values() for device in group], warnings
