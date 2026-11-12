"""Persistent helper edits use HA's registered collection API, never .storage."""
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch
import asyncio

from homeassistant.core import Context, HomeAssistant
from homeassistant.components.input_select import InputSelectStorageCollection, InputSelectStore, STORAGE_FIELDS
from homeassistant.helpers.collection import IDManager, DictStorageCollectionWebsocket
from homeassistant.helpers import category_registry as cr, device_registry as dr, entity_registry as er
from homeassistant.helpers.script import Script, async_validate_actions_config
from homeassistant.helpers import config_validation as cv
from custom_components.switch_manager.const import DOMAIN, CONF_MANAGED_SWITCHES
from custom_components.switch_manager.farhome.store import FarhomeStore
from custom_components.switch_manager.farhome.selector import async_read_selector, async_update_selector, build_selector_action
from custom_components.switch_manager.models import ManagedSwitchConfigButtonAction
from tests.fixtures import MemoryStorage


class SelectorTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.hass = HomeAssistant(self.directory.name)
        self.hass.loop.slow_callback_duration = 1
        self.collection = InputSelectStorageCollection(InputSelectStore(self.hass, 1, 'input_select', minor_version=2), IDManager())
        await self.collection.async_load()
        self.item = await self.collection.async_create_item({'name': 'Original name', 'options': ['light.a', 'light.b'], 'initial': 'light.a', 'icon': 'mdi:lightbulb'})
        DictStorageCollectionWebsocket(self.collection, 'input_select', 'input_select', STORAGE_FIELDS, STORAGE_FIELDS).async_setup(self.hass)
        self.hass.states.async_set('input_select.renamed', 'light.a', {'options': ['light.a', 'light.b']})
        for entity_id in ['light.a', 'light.b', 'light.c']:
            self.hass.states.async_set(entity_id, 'on', {'supported_color_modes': ['brightness']})
        self.metadata = FarhomeStore(self.hass, storage=MemoryStorage())
        await self.metadata.async_load()
        await self.metadata.async_update(self.metadata.revision, {'bindings': {'1': {'device_id': 'device', 'verified': True, 'conflicts_checked': True, 'selector_helper': 'input_select.renamed'}}})
        self.hass.data[DOMAIN] = {'farhome': self.metadata, CONF_MANAGED_SWITCHES: {'1': SimpleNamespace(enabled=True, name='Knob')}}
        self.er = SimpleNamespace(async_get=lambda key: SimpleNamespace(platform='input_select', unique_id=self.item['id']) if key == 'input_select.renamed' else None)
        self.patches = [patch('custom_components.switch_manager.farhome.selector.er.async_get', return_value=self.er), patch('custom_components.switch_manager.farhome.selector.dr.async_get', return_value=SimpleNamespace(async_get=lambda key: SimpleNamespace(id=key) if key == 'device' else None))]
        for item in self.patches:
            item.start()
        self.fail_active = False
        self.external_change = False
        async def changed(kind, item_id, config):
            state = self.hass.states.get('input_select.renamed')
            self.hass.states.async_set('input_select.renamed', state.state, {'options': config['options']})
            if self.external_change:
                self.external_change = False
                await self.collection.async_update_item(item_id, {k: v for k, v in {**config, 'name': 'External editor'}.items() if k != 'id'})
        self.collection.async_add_listener(changed)
        async def select(call):
            if self.fail_active:
                raise RuntimeError('synthetic selection failure')
            current = self.hass.states.get('input_select.renamed')
            self.hass.states.async_set('input_select.renamed', call.data['option'], dict(current.attributes))
        self.hass.services.async_register('input_select', 'select_option', select)

    async def asyncTearDown(self):
        for item in self.patches:
            item.stop()
        await self.hass.async_stop(force=True)
        self.directory.cleanup()

    async def update(self, options=None, active=None, initial=None, ack=False, revision=None):
        current = await async_read_selector(self.hass, 'input_select.renamed', config_id='1')
        return await async_update_selector(self.hass, 'input_select.renamed', options or ['light.a', 'light.b'], active, initial, revision or current['revision'], ack, config_id='1')

    async def test_create_ordered_helper_uses_registry_id_and_retries_without_duplicates(self):
        from custom_components.switch_manager.farhome.selector import async_create_selector

        await cr.async_load(self.hass, load_empty=True)
        categories = cr.async_get(self.hass)
        existing = categories.async_create(scope='helpers', name='My category')
        unrelated = categories.async_create(scope='automations', name='Farhome')
        self.patches[1].stop()
        dr.async_setup(self.hass)
        await dr.async_load(self.hass, load_empty=True)
        registry = er.EntityRegistry(self.hass)
        with patch.object(self.hass, 'config_entries', SimpleNamespace(async_wait_initialized=AsyncMock())):
            await registry.async_load(load_empty=True)

        async def register(kind, item_id, config):
            entry = registry.async_get_or_create('input_select', 'input_select', item_id, suggested_object_id=f'registry_{item_id}')
            self.hass.states.async_set(entry.entity_id, config.get('initial', config['options'][0]), {'options': config['options']})

        self.collection.async_add_listener(register)
        await register(None, self.item['id'], self.item)
        existing_entity = registry.async_get_entity_id('input_select', 'input_select', self.item['id'])
        registry.async_update_entity(existing_entity, categories={'helpers': existing.category_id})
        before = self.metadata.snapshot()
        with patch('custom_components.switch_manager.farhome.selector.er.async_get', return_value=registry):
            a, b = await asyncio.gather(*(
                async_create_selector(self.hass, 'Lights', ['light.b', 'light.a'], 'light.a') for _ in range(2)
            ))
            self.assertEqual(len(self.collection.async_items()), 2)
            second = await async_create_selector(self.hass, 'More lights', ['light.a'], None)
            reused = await async_create_selector(self.hass, self.item['name'], self.item['options'], self.item['initial'])
            with self.assertRaisesRegex(ValueError, 'helper_name_exists'):
                await async_create_selector(self.hass, 'Lights', ['light.a'], None)
        self.assertEqual(a, b)
        self.assertEqual(a['entity_id'], 'input_select.registry_lights')
        self.assertEqual(self.collection.async_items()[1]['options'], ['light.b', 'light.a'])
        self.assertEqual(self.collection.async_items()[1]['initial'], 'light.a')
        self.assertEqual(self.metadata.snapshot(), before)
        farhome = [entry for entry in categories.async_list_categories(scope='helpers') if entry.name == 'Farhome']
        self.assertEqual(len(farhome), 1)
        self.assertNotEqual(farhome[0].category_id, unrelated.category_id)
        for created in (a, second):
            self.assertEqual(registry.async_get(created['entity_id']).categories['helpers'], farhome[0].category_id)
        self.assertEqual(reused['entity_id'], existing_entity)
        self.assertEqual(registry.async_get(existing_entity).categories['helpers'], existing.category_id)

    async def test_yaml_options_are_read_only(self):
        self.er.async_get = lambda key: None
        result = await async_read_selector(self.hass, 'input_select.renamed', config_id='1')
        self.assertFalse(result['editable'])
        with self.assertRaisesRegex(ValueError, 'read_only'):
            await self.update()

    async def test_ui_options_survive_store_reload(self):
        result = await self.update(['light.b', 'light.a', 'light.c'])
        self.assertTrue(result['editable'])
        await self.hass.async_stop(force=True)
        other = HomeAssistant(self.directory.name)
        collection = InputSelectStorageCollection(InputSelectStore(other, 1, 'input_select', minor_version=2), IDManager())
        await collection.async_load()
        self.assertEqual(collection.async_items()[0]['options'], ['light.b', 'light.a', 'light.c'])
        self.assertEqual(collection.async_items()[0]['icon'], 'mdi:lightbulb')
        self.assertEqual(collection.async_items()[0]['name'], 'Original name')
        await other.async_stop(force=True)

    async def test_invalid_empty_duplicate_mixed_or_missing_entities_rejected(self):
        current = await async_read_selector(self.hass, 'input_select.renamed', config_id='1')
        for options in [[], ['light.a', 'light.a'], ['light.a', 'fan.a'], ['light.missing']]:
            with self.subTest(options=options), self.assertRaisesRegex(ValueError, 'validation_error'):
                await async_update_selector(self.hass, 'input_select.renamed', options, None, None, current['revision'], False, config_id='1')

    async def test_unavailable_light_preserved(self):
        self.hass.states.async_set('light.b', 'unavailable', {'supported_color_modes': ['brightness']})
        self.assertEqual((await self.update(['light.b', 'light.a']))['options'], ['light.b', 'light.a'])

    async def test_removed_active_or_initial_requires_valid_replacement(self):
        with self.assertRaisesRegex(ValueError, 'replacement_required'):
            await self.update(['light.b'])
        result = await self.update(['light.b'], 'light.b', 'light.b')
        self.assertEqual(result['active'], 'light.b')
        self.assertEqual(result['initial'], 'light.b')

    async def test_clearing_initial_removes_it_from_storage(self):
        result = await self.update(['light.b'], 'light.b', '')
        self.assertIsNone(result['initial'])
        self.assertNotIn('initial', self.collection.async_items()[0])

    async def test_shared_helper_requires_acknowledgment(self):
        await self.metadata.async_update(self.metadata.revision, {'bindings': {'2': {'device_id': 'device', 'selector_helper': 'input_select.renamed'}}})
        with self.assertRaisesRegex(ValueError, 'dependencies_acknowledgment_required'):
            await self.update(['light.b', 'light.a'])
        self.assertEqual(len((await self.update(['light.b', 'light.a'], ack=True))['known_references']), 2)

    async def test_external_conflict_detected_without_blind_rollback(self):
        self.external_change = True
        with self.assertRaisesRegex(ValueError, 'partial_write|conflict'):
            await self.update(['light.b', 'light.a'])
        self.assertEqual(self.collection.async_items()[0]['name'], 'External editor')

    async def test_partial_active_update_reported(self):
        self.fail_active = True
        with self.assertRaisesRegex(ValueError, 'partial_write'):
            await self.update(['light.b'], 'light.b', 'light.b')
        self.assertEqual(self.collection.async_items()[0]['options'], ['light.b'])

    async def test_external_or_disabled_controller_cannot_edit_shared_helper(self):
        self.hass.data[DOMAIN][CONF_MANAGED_SWITCHES]['1'].enabled = False
        self.assertFalse((await async_read_selector(self.hass, 'input_select.renamed', config_id='1'))['editable'])
        with self.assertRaisesRegex(ValueError, 'read_only'):
            await self.update()

    async def test_stale_revision_rejected_and_generator_snapshots_event_selection(self):
        old = (await async_read_selector(self.hass, 'input_select.renamed', config_id='1'))['revision']
        await self.update(['light.b', 'light.a'])
        with self.assertRaisesRegex(ValueError, 'conflict'):
            await self.update(revision=old)
        result = build_selector_action('input_select.renamed', 'brightness_down', 10, .1)
        self.assertEqual(result['sequence'][-1]['data']['brightness_step_pct'], -10)
        self.assertEqual(result['sequence'][-1]['data']['transition'], .1)
        self.assertIn("states('input_select.renamed')", result['sequence'][0]['variables']['farhome_selected_light'])
        self.assertIn('has_value', result['sequence'][1]['value_template'])

    async def test_generated_script_targets_event_selection_and_guards_invalid_option(self):
        calls = []
        async def turn_on(call):
            calls.append(dict(call.data))
        self.hass.services.async_register('light', 'turn_on', turn_on)
        value = build_selector_action('input_select.renamed', 'brightness_up')
        sequence = await async_validate_actions_config(self.hass, cv.SCRIPT_SCHEMA(value['sequence']))
        script = Script(self.hass, sequence, 'Synthetic selector', DOMAIN, script_mode='restart')
        self.hass.states.async_set('input_select.renamed', 'light.b', {'options': ['light.a', 'light.b']})
        await script.async_run()
        self.assertEqual(calls[0]['entity_id'], ['light.b'])
        self.hass.states.async_set('input_select.renamed', 'fan.unrelated', {'options': ['fan.unrelated']})
        await script.async_run()
        self.assertEqual(len(calls), 1)

    async def test_generated_next_action_cycles_and_toggles_feedback(self):
        next_action = build_selector_action('input_select.renamed', 'next')
        self.assertEqual(next_action['mode'], 'queued')
        self.assertEqual(len(next_action['sequence']), 6)
        self.assertEqual(next_action['sequence'][0]['action'], 'input_select.select_next')
        self.assertEqual(next_action['sequence'][3]['action'], 'light.toggle')
        self.assertEqual(next_action['sequence'][4]['delay'], {'milliseconds': 500})
        self.assertEqual(next_action['sequence'][5]['action'], 'light.toggle')
        self.assertIn("states('input_select.renamed')", next_action['sequence'][1]['variables']['farhome_selected_light'])

    async def test_saved_feedback_completes_both_toggles_on_rapid_clicks(self):
        helper = 'input_select.renamed'
        first_toggle = asyncio.Event()
        calls = []

        async def select_next(call):
            current = self.hass.states.get(helper)
            selected = 'light.b' if current.state == 'light.a' else 'light.a'
            self.hass.states.async_set(helper, selected, dict(current.attributes))

        async def toggle(call):
            entity_id, = call.data['entity_id']
            current = self.hass.states.get(entity_id)
            self.hass.states.async_set(entity_id, 'off' if current.state == 'on' else 'on')
            calls.append(entity_id)
            first_toggle.set()

        self.hass.services.async_register('input_select', 'select_next', select_next)
        self.hass.services.async_register('light', 'toggle', toggle)
        config = {**build_selector_action(helper, 'next'), 'mode': 'restart'}
        action = ManagedSwitchConfigButtonAction(self.hass, '1', 0, 0, None, config)
        await self.hass.async_block_till_done()
        async with asyncio.timeout(5):
            async with asyncio.TaskGroup() as tasks:
                tasks.create_task(action.run({}, Context()))
                await first_toggle.wait()
                tasks.create_task(action.run({}, Context()))
        self.assertEqual(calls, ['light.b', 'light.b', 'light.a', 'light.a'])
        self.assertEqual([self.hass.states.get(entity).state for entity in ('light.a', 'light.b')], ['on', 'on'])

