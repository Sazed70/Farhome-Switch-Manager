"""Join HA registries with explicit associations; ambiguous matches stay visible."""
from __future__ import annotations

from copy import deepcopy
from homeassistant.helpers import area_registry as ar, device_registry as dr, entity_registry as er

from ..const import DOMAIN, CONF_MANAGED_SWITCHES
from .types import revision, config_snapshot
from .zigbee2mqtt import has_actions, resolve_image, async_definitions


def _definitions_for(device, definitions):
    identifiers = {(domain, value.lower()) for domain, value in device.get("identifiers", []) if isinstance(value, str)}
    return [item for item in definitions if ("mqtt", f"zigbee2mqtt_{item['ieee_address']}") in identifiers]


def build_inventory(areas, devices, entities, configs, metadata, definitions):
    devices_by_id = {device["id"]: device for device in devices}
    entity_devices = {entity["entity_id"]: entity.get("device_id") for entity in entities}
    matches = {device["id"]: _definitions_for(device, definitions) for device in devices}
    bound = {device["id"]: [] for device in devices}
    unassociated = []
    bindings = metadata.get("bindings", {})
    for config_id, config in configs.items():
        binding = bindings.get(config_id)
        reason = "unresolved"
        candidates = []
        if binding:
            candidate = binding.get("device_id")
            if candidate in devices_by_id:
                candidates = [candidate]
            else:
                reason = "missing_device"
        else:
            blueprint = config.get("blueprint") if isinstance(config.get("blueprint"), dict) else {}
            identifier = config.get("identifier")
            if blueprint.get("is_event_entity"):
                candidate = entity_devices.get(identifier)
                candidates = [candidate] if candidate in devices_by_id else []
            elif blueprint.get("is_zigbee2mqtt"):
                candidates = [device_id for device_id, items in matches.items() if any(identifier == f"{item['base_topic']}/{item['friendly_name']}/action" for item in items)]
        if len(candidates) == 1:
            bound[candidates[0]].append(config_id)
        else:
            unassociated.append({"config_id": config_id, "name": config.get("name", config_id), "reason": "ambiguous" if candidates else reason})
    controllers = []
    for device in devices:
        device_id = device["id"]
        meta = metadata.get("controllers", {}).get(device_id, {})
        items = matches[device_id]
        if not bound[device_id] and not meta and not any(has_actions(item.get("definition")) for item in items):
            continue
        definition = items[0].get("definition") if len(items) == 1 else None
        blueprint = None
        blueprint_ids = {configs[key].get("blueprint", {}).get("id") for key in bound[device_id] if isinstance(configs[key].get("blueprint"), dict)}
        if len(blueprint_ids) == 1 and bound[device_id]:
            blueprint = configs[bound[device_id][0]].get("blueprint")
        verified = any(bindings.get(key, {}).get("verified") and isinstance(configs[key].get("blueprint"), dict) and configs[key].get("valid_blueprint", True) and not configs[key].get("is_mismatch") for key in bound[device_id])
        controllers.append({
            "device_id": device_id, "name": device.get("name_by_user") or device.get("name") or device_id,
            "area_id": device.get("area_id"), "manufacturer": (definition or {}).get("vendor") or device.get("manufacturer") or "",
            "model": (definition or {}).get("model") or device.get("model") or "",
            "config_ids": sorted(bound[device_id]),
            "management": "external" if meta.get("management") == "external" else ("farhome" if bound[device_id] else "unknown"),
            "compatibility": "verified" if verified else "unverified",
            "external_automations": deepcopy(meta.get("external_automations", [])),
            "image": resolve_image(definition, blueprint, items[0].get("icon") if len(items) == 1 else None),
        })
    result = {"areas": deepcopy(areas), "controllers": controllers, "unassociated_configs": unassociated, "warnings": []}
    result["revision"] = revision({"metadata": metadata, "configs": configs, "controllers": controllers, "areas": areas})
    return result


async def async_snapshot(hass):
    areas = [{"id": area.id, "name": area.name} for area in ar.async_get(hass).async_list_areas()]
    devices = [{"id": device.id, "name": device.name, "name_by_user": device.name_by_user, "manufacturer": device.manufacturer, "model": device.model, "area_id": device.area_id, "identifiers": sorted(device.identifiers)} for device in dr.async_get(hass).devices.values()]
    entities = [{"entity_id": entity.entity_id, "device_id": entity.device_id} for entity in er.async_get(hass).entities.values()]
    store = hass.data[DOMAIN]["farhome"]
    configs = {str(key): config_snapshot(value) for key, value in hass.data[DOMAIN][CONF_MANAGED_SWITCHES].items()}
    definitions, warnings = await async_definitions(hass)
    result = build_inventory(areas, devices, entities, configs, store.snapshot(), definitions)
    result["metadata_revision"] = store.revision
    result["metadata"] = store.snapshot()
    result["warnings"].extend(warnings)
    result["available_devices"] = [{key: value for key, value in device.items() if key != "identifiers"} for device in devices]
    return result
