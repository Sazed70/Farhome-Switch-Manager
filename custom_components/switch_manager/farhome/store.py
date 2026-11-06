"""Versioned Farhome associations. Never mix metadata into script variables."""
from __future__ import annotations

import asyncio
from copy import deepcopy
from homeassistant.helpers.storage import Store

from .types import revision


class FarhomeStore:
    def __init__(self, hass, *, storage=None):
        self.storage = storage if storage is not None else Store(hass, 1, "switch_manager.farhome")
        self.lock = asyncio.Lock()
        self.config_lock = asyncio.Lock()
        self._data = {"version": 1, "controllers": {}, "bindings": {}}

    async def async_load(self):
        stored = await self.storage.async_load()
        if stored is not None:
            if not isinstance(stored, dict) or stored.get("version") != 1:
                raise ValueError("unsupported_metadata_version")
            self.validate(stored)
            self._data = deepcopy(stored)

    @property
    def revision(self):
        return revision(self._data)

    def snapshot(self):
        return deepcopy(self._data)

    @staticmethod
    def validate(data):
        if set(data) != {"version", "controllers", "bindings"}:
            raise ValueError("invalid_metadata_fields")
        for namespace in ("controllers", "bindings"):
            records = data.get(namespace)
            if not isinstance(records, dict) or len(records) > 5000:
                raise ValueError("invalid_metadata_records")
            if any(not isinstance(key, str) or not key or len(key) > 255 or not isinstance(value, dict) for key, value in records.items()):
                raise ValueError("invalid_metadata_record")
        for controller in data["controllers"].values():
            if set(controller) - {"manual", "management", "external_automations"}:
                raise ValueError("invalid_controller_fields")
            if "manual" in controller and not isinstance(controller["manual"], bool):
                raise ValueError("invalid_manual_flag")
            if controller.get("management", "unknown") not in ("unknown", "external"):
                raise ValueError("invalid_management")
            refs = controller.get("external_automations", [])
            if not isinstance(refs, list) or len(refs) > 100 or any(not isinstance(ref, str) or not ref.startswith("automation.") or len(ref) > 255 for ref in refs):
                raise ValueError("invalid_external_reference")
        for binding in data["bindings"].values():
            if set(binding) - {"device_id", "verified", "selector_helper", "conflicts_checked"}:
                raise ValueError("invalid_binding_fields")
            if not isinstance(binding.get("device_id"), str) or not binding["device_id"]:
                raise ValueError("invalid_binding_device")
            if any(key in binding and not isinstance(binding[key], bool) for key in ("verified", "conflicts_checked")):
                raise ValueError("invalid_binding_flag")
            helper = binding.get("selector_helper")
            if helper is not None and (not isinstance(helper, str) or not helper.startswith("input_select.")):
                raise ValueError("invalid_selector_reference")

    def patched(self, patch):
        if not isinstance(patch, dict) or set(patch) - {"controllers", "bindings"}:
            raise ValueError("invalid_metadata_patch")
        candidate = self.snapshot()
        for namespace, records in patch.items():
            if not isinstance(records, dict):
                raise ValueError("invalid_metadata_patch")
            for key, value in records.items():
                if value is None:
                    candidate[namespace].pop(key, None)
                else:
                    candidate[namespace][key] = deepcopy(value)
        self.validate(candidate)
        return candidate

    async def async_update(self, expected_revision, patch):
        async with self.lock:
            if expected_revision != self.revision:
                raise ValueError("conflict")
            candidate = self.patched(patch)
            await self.storage.async_save(candidate)
            self._data = candidate
            return self.revision
