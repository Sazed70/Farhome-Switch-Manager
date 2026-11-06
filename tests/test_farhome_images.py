import unittest
from custom_components.switch_manager.farhome.zigbee2mqtt import resolve_image, parse_devices


class ImageTests(unittest.TestCase):
    def test_images_require_exact_definition_and_fall_back(self):
        self.assertIsNone(resolve_image(None, None))
        image = resolve_image({"model": "ZG-101ZD"}, None)
        self.assertEqual(image["url"], "https://www.zigbee2mqtt.io/images/devices/ZG-101ZD.png")
        self.assertEqual(image["source_label"], "Zigbee2MQTT")
        self.assertEqual(resolve_image(None, {"id": "synthetic-knob", "has_image": True})["url"], "/assets/switch_manager/synthetic-knob.png")

    def test_custom_https_image_keeps_source_credit(self):
        image = resolve_image({"model": "ZG-101ZD"}, None, "https://images.example.test/my-knob.png")
        self.assertEqual(image["url"], "https://images.example.test/my-knob.png")
        self.assertEqual(image["source_label"], "Zigbee2MQTT · personalizzata")

    def test_unsafe_or_ingress_image_is_not_trusted(self):
        for unsafe in ("javascript:alert(1)", "data:image/svg+xml,test", "http://user:secret@example.test/image.png", "device_icons/local.png", "//example.test/x.png"):
            with self.subTest(unsafe=unsafe):
                self.assertIsNone(resolve_image(None, None, unsafe))
        self.assertIsNone(resolve_image({"model": "../../private"}, None))
        self.assertIsNone(resolve_image(None, {"id": "../private", "has_image": True}))

    def test_malformed_oversized_or_non_device_payload_rejected(self):
        for value in ("{}", "null", "not-json", '[{"friendly_name":"x"}]'):
            self.assertEqual(parse_devices(value, "z2m"), [])
        self.assertEqual(parse_devices(" " * 2_000_001, "z2m"), [])

    def test_parse_devices_keeps_mqtt_namespace(self):
        devices = parse_devices('[{"ieee_address":"0xABC","friendly_name":"room/knob","definition":{"model":"ZG-101ZD"}}]', "home/z2m")
        self.assertEqual(devices[0]["ieee_address"], "0xabc")
        self.assertEqual(devices[0]["base_topic"], "home/z2m")
        self.assertEqual(devices[0]["friendly_name"], "room/knob")
