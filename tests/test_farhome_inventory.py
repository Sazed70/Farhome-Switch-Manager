import unittest
from copy import deepcopy
from custom_components.switch_manager.farhome.inventory import build_inventory
from tests.fixtures import registry_fixture, switch_config


class InventoryTests(unittest.TestCase):
    def snapshot(self, *, configs=None, metadata=None, devices=None, definitions=None):
        areas, registered, z2m = registry_fixture()
        return build_inventory(areas, devices if devices is not None else registered, [], configs or {}, metadata or {"controllers": {}, "bindings": {}}, definitions if definitions is not None else z2m)

    def test_inventory_keeps_empty_areas_and_unassociated_configs(self):
        result = self.snapshot(configs={"9": switch_config("9", "missing/topic/action")})
        self.assertEqual([a["id"] for a in result["areas"]], ["room", "empty"])
        self.assertEqual([d["device_id"] for d in result["controllers"]], ["knob"])
        self.assertEqual(result["unassociated_configs"][0]["config_id"], "9")
        self.assertEqual(result["unassociated_configs"][0]["reason"], "unresolved")

    def test_manual_device_without_blueprint_is_not_executable(self):
        result = self.snapshot(metadata={"controllers": {"thermometer": {"manual": True}}, "bindings": {}})
        device = next(d for d in result["controllers"] if d["device_id"] == "thermometer")
        self.assertEqual(device["compatibility"], "unverified")
        self.assertEqual(device["config_ids"], [])
        self.assertEqual(device["management"], "unknown")

    def test_controller_deduplicates_multiple_configs(self):
        result = self.snapshot(configs={"0": switch_config("0"), "1": switch_config("1")})
        self.assertEqual(len(result["controllers"]), 1)
        self.assertEqual(result["controllers"][0]["config_ids"], ["0", "1"])
        self.assertEqual(result["controllers"][0]["model"], "ZG-101ZD")

    def test_ambiguous_mqtt_identifier_is_not_bound(self):
        _, devices, _ = registry_fixture()
        duplicate = deepcopy(devices[0])
        duplicate["id"] = "second-knob"
        result = self.snapshot(devices=devices + [duplicate], configs={"0": switch_config()})
        self.assertTrue(all(not d["config_ids"] for d in result["controllers"]))
        self.assertEqual(result["unassociated_configs"][0]["reason"], "ambiguous")

    def test_readded_device_leaves_stale_binding_visible(self):
        result = self.snapshot(configs={"0": switch_config()}, metadata={"controllers": {}, "bindings": {"0": {"device_id": "removed-device", "verified": True}}})
        self.assertEqual(result["unassociated_configs"][0]["reason"], "missing_device")
        self.assertEqual(result["controllers"][0]["config_ids"], [])

    def test_other_mqtt_base_is_not_inferred_from_friendly_name(self):
        result = self.snapshot(configs={"0": switch_config(identifier="other/desk/action")})
        self.assertEqual(result["unassociated_configs"][0]["reason"], "unresolved")

    def test_external_management_is_separate_from_compatibility(self):
        result = self.snapshot(metadata={"controllers": {"knob": {"management": "external", "external_automations": ["automation.synthetic"]}}, "bindings": {}})
        self.assertEqual(result["controllers"][0]["management"], "external")
        self.assertEqual(result["controllers"][0]["compatibility"], "unverified")

    def test_no_battery_based_controller_detection(self):
        self.assertEqual(self.snapshot(definitions=[])["controllers"], [])

    def test_ieee_address_case_does_not_hide_controller(self):
        _, devices, definitions = registry_fixture()
        devices[0]["identifiers"] = [["mqtt", "zigbee2mqtt_0xAABBCC"]]
        definitions[0]["ieee_address"] = "0xaabbcc"
        result = self.snapshot(devices=devices, definitions=definitions)
        self.assertEqual(result["controllers"][0]["device_id"], "knob")
