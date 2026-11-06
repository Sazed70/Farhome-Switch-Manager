import unittest
from custom_components.switch_manager.farhome.store import FarhomeStore
from tests.fixtures import MemoryStorage


class StoreTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.storage = MemoryStorage()
        self.store = FarhomeStore(None, storage=self.storage)
        await self.store.async_load()

    async def test_metadata_save_failure_preserves_previous_data(self):
        before = self.store.snapshot()
        self.storage.fail = True
        with self.assertRaises(OSError):
            await self.store.async_update(self.store.revision, {"controllers": {"knob": {"manual": True}}})
        self.assertEqual(self.store.snapshot(), before)

    async def test_stale_update_cannot_overwrite_new_metadata(self):
        revision = self.store.revision
        await self.store.async_update(revision, {"controllers": {"knob": {"manual": True}}})
        with self.assertRaisesRegex(ValueError, "conflict"):
            await self.store.async_update(revision, {"controllers": {}})
        self.assertTrue(self.store.snapshot()["controllers"]["knob"]["manual"])

    async def test_metadata_persists_after_reload(self):
        await self.store.async_update(self.store.revision, {"bindings": {"0": {"device_id": "knob", "verified": True}}})
        reloaded = FarhomeStore(None, storage=self.storage)
        await reloaded.async_load()
        self.assertEqual(reloaded.snapshot()["bindings"]["0"]["device_id"], "knob")

    async def test_snapshot_is_not_a_mutable_storage_reference(self):
        snapshot = self.store.snapshot()
        snapshot["controllers"]["injected"] = {}
        self.assertEqual(self.store.snapshot()["controllers"], {})

    async def test_future_version_is_not_silently_reset(self):
        store = FarhomeStore(None, storage=MemoryStorage({"version": 999}))
        with self.assertRaisesRegex(ValueError, "version"):
            await store.async_load()
