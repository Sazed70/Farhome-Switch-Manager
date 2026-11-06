from copy import deepcopy


class MemoryStorage:
    """Replace only disk IO, not the store's validation/revision logic."""
    def __init__(self, data=None):
        self.data = deepcopy(data)
        self.fail = False

    async def async_load(self):
        return deepcopy(self.data)

    async def async_save(self, data):
        if self.fail:
            raise OSError("synthetic disk failure")
        self.data = deepcopy(data)


def registry_fixture():
    return (
        [{"id": "room", "name": "Camera"}, {"id": "empty", "name": "Stanza vuota"}],
        [{"id": "knob", "name": "Rotella", "manufacturer": "HOBEIAN", "model": "Smart knob", "area_id": "room", "identifiers": [["mqtt", "zigbee2mqtt_0x001122"]]}, {"id": "thermometer", "name": "Termometro", "manufacturer": "Other", "model": "Sensor", "area_id": "room", "identifiers": []}],
        [{"base_topic": "z2m", "ieee_address": "0x001122", "friendly_name": "desk", "definition": {"vendor": "HOBEIAN", "model": "ZG-101ZD", "exposes": [{"type": "enum", "property": "action", "values": ["single", "double", "hold", "rotate_left", "rotate_right"]}]}}],
    )


def switch_config(config_id="0", identifier="z2m/desk/action"):
    return {"id": config_id, "name": "Rotella", "enabled": False, "identifier": identifier, "blueprint": {"id": "synthetic-knob", "is_event_entity": False, "is_zigbee2mqtt": True, "has_image": False}, "buttons": [{"actions": [{"mode": "restart", "sequence": []}]}]}
