"""Farhome extensions; inherited Switch Manager retains execution ownership."""
from ..const import DOMAIN
from .store import FarhomeStore


async def async_setup_farhome(hass):
    store = FarhomeStore(hass)
    await store.async_load()
    hass.data[DOMAIN]["farhome"] = store
