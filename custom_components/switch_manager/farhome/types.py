"""Farhome DTOs and stable revisions, separate from runtime script objects."""
from __future__ import annotations

from copy import deepcopy
import hashlib
import json
from typing import Any, TypedDict


class Image(TypedDict):
    url: str
    source_url: str
    source_label: str


def revision(value: Any) -> str:
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()).hexdigest()


def config_snapshot(config: Any) -> dict:
    """Exclude listeners/Script instances; preserve the executable configuration."""
    if isinstance(config, dict):
        return deepcopy(config)
    return {
        "id": str(config.id), "name": config.name, "enabled": config.enabled,
        "identifier": config.identifier, "rotate": config.rotate,
        "variables": deepcopy(config.variables),
        "blueprint": json.loads(json.dumps(config.blueprint, default=lambda value: value.as_dict())) if config.valid_blueprint else str(config.blueprint),
        "valid_blueprint": config.valid_blueprint, "is_mismatch": config.is_mismatch,
        "_error": config._error,
        "buttons": [{"actions": [deepcopy(action.as_dict()) for action in button.actions]} for button in config.buttons],
    }
