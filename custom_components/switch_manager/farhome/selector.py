"""Revision-guarded edits through the native input_select collection API."""
from __future__ import annotations

import asyncio
from copy import deepcopy
import re
from types import SimpleNamespace

from homeassistant.helpers import category_registry as cr, entity_registry as er, device_registry as dr
from ..const import DOMAIN, CONF_MANAGED_SWITCHES
from .config_service import FarhomeError
from .types import revision

HELPER = re.compile(r'^input_select\.[a-z0-9_]+$')
LIGHT = re.compile(r'^light\.[a-z0-9_]+$')
HELPER_CATEGORY_SCOPE = 'helpers'
HELPER_CATEGORY_NAME = 'Farhome'


async def _native_call(hass, command, **fields):
    """Use the same validated, administrative API as HA's helper editor.

    HA intentionally does not expose the input_select storage collection in
    hass.data. Fail closed if its registered API changes or isn't loaded.
    """
    if command not in ('input_select/list', 'input_select/create', 'input_select/update'):
        raise FarhomeError('read_only')
    registered = hass.data.get('websocket_api', {}).get(command)
    if not registered:
        raise FarhomeError('read_only', 'API helper non disponibile.')
    future = hass.loop.create_future()
    def result(_id, value=None):
        if not future.done():
            future.set_result(deepcopy(value))
    def error(_id, code, message):
        if not future.done():
            future.set_exception(FarhomeError('helper_api_error', f'{code}: {message}'))
    connection = SimpleNamespace(user=SimpleNamespace(is_admin=True), send_result=result, send_error=error,
                                 async_handle_exception=lambda msg, err: error(msg['id'], 'native_error', str(err)))
    handler, schema = registered
    try:
        handler(hass, connection, schema({'id': 1, 'type': command, **fields}))
        return await asyncio.wait_for(future, 10)
    except FarhomeError:
        raise
    except Exception as err:
        raise FarhomeError('helper_api_error', 'Impossibile completare la richiesta al gestore helper.') from err


def validate_light_options(hass, options):
    if (not isinstance(options, list) or not 1 <= len(options) <= 500
            or any(not isinstance(value, str) or not LIGHT.fullmatch(value) or hass.states.get(value) is None for value in options)
            or len(set(options)) != len(options)):
        raise FarhomeError('validation_error', 'La lista deve contenere luci esistenti, senza duplicati.')


async def async_create_selector(hass, name, options, initial=None):
    name = name.strip()
    if not name or len(name) > 255:
        raise FarhomeError('validation_error', 'Nome non valido.')
    async with hass.data[DOMAIN]['farhome'].config_lock:
        validate_light_options(hass, options)
        if initial is not None and initial not in options:
            raise FarhomeError('validation_error', 'La luce iniziale deve essere nell’elenco.')
        items = await _native_call(hass, 'input_select/list')
        matches = [item for item in items if item['name'].casefold() == name.casefold()]
        if matches:
            if len(matches) != 1 or matches[0]['options'] != options or matches[0].get('initial') != initial:
                raise FarhomeError('helper_name_exists')
            # Retrying an interrupted create can attach the same helper.
            item = matches[0]
        else:
            fields = {'name': name, 'options': options}
            if initial is not None:
                fields['initial'] = initial
            item = await _native_call(hass, 'input_select/create', **fields)
        registry = er.async_get(hass)
        entity_id = registry.async_get_entity_id('input_select', 'input_select', item['id'])
        if entity_id is None:
            raise FarhomeError('helper_created_unavailable')
        if not matches:
            categories = cr.async_get(hass)
            scope = HELPER_CATEGORY_SCOPE
            category = next((entry for entry in categories.async_list_categories(scope=scope)
                             if entry.name.casefold() == HELPER_CATEGORY_NAME.casefold()), None)
            if category is None:
                category = categories.async_create(scope=scope, name=HELPER_CATEGORY_NAME)
            entry = registry.async_get(entity_id)
            registry.async_update_entity(entity_id, categories={**entry.categories, scope: category.category_id})
        if hass.states.get(entity_id) is None:
            raise FarhomeError('helper_created_unavailable')
        return {'entity_id': entity_id}


def _references(hass, entity_id):
    metadata = hass.data[DOMAIN]['farhome'].snapshot()
    refs = [{'type': 'config', 'id': key} for key, value in metadata['bindings'].items() if value.get('selector_helper') == entity_id]
    external = set()
    for ref in refs:
        binding = metadata['bindings'][ref['id']]
        external.update(metadata['controllers'].get(binding['device_id'], {}).get('external_automations', []))
    return refs + [{'type': 'automation', 'id': key} for key in sorted(external)]


def _eligible(hass, entity_id, config_id):
    metadata = hass.data[DOMAIN]['farhome'].snapshot()
    binding = metadata['bindings'].get(str(config_id), {})
    controller = metadata['controllers'].get(binding.get('device_id'), {})
    config = hass.data[DOMAIN][CONF_MANAGED_SWITCHES].get(str(config_id))
    return bool(config and config.enabled and binding.get('verified') and binding.get('conflicts_checked')
                and binding.get('selector_helper') == entity_id and controller.get('management') != 'external'
                and dr.async_get(hass).async_get(binding.get('device_id')) is not None)


async def _read(hass, entity_id, config_id):
    if not isinstance(entity_id, str) or not HELPER.fullmatch(entity_id):
        raise FarhomeError('validation_error', 'Seleziona un input_select esistente.')
    state = hass.states.get(entity_id)
    if state is None:
        raise FarhomeError('not_found', 'Helper non disponibile.')
    entry = er.async_get(hass).async_get(entity_id)
    item = None
    if entry is not None and entry.platform == 'input_select':
        try:
            items = await _native_call(hass, 'input_select/list')
            item = next((value for value in items if value['id'] == entry.unique_id), None)
        except FarhomeError:
            pass
    refs = _references(hass, entity_id)
    eligible = _eligible(hass, entity_id, config_id)
    result = {'entity_id': entity_id, 'options': deepcopy(item['options'] if item else state.attributes.get('options', [])),
              'active': state.state, 'initial': item.get('initial') if item else None,
              'origin': 'ui' if item else 'yaml_or_unknown', 'editable': bool(item and eligible),
              'readonly_reason': None if item and eligible else ('controller_not_migrated' if item else 'yaml_or_unknown'),
              'known_references': refs}
    result['revision'] = revision({'item': item, 'state': state.state, 'references': refs, 'eligible': eligible})
    return result, item


async def async_read_selector(hass, entity_id, *, config_id=None):
    result, _ = await _read(hass, entity_id, config_id)
    return result


async def async_update_selector(hass, entity_id, options, active, initial, expected_revision, dependencies_acknowledged, *, config_id=None):
    locks = hass.data[DOMAIN].setdefault('farhome_selector_locks', {})
    async with locks.setdefault(entity_id, asyncio.Lock()):
        # Serialize migration/activation changes with this helper edit, too.
        async with hass.data[DOMAIN]['farhome'].config_lock:
            before, item = await _read(hass, entity_id, config_id)
            if before['revision'] != expected_revision:
                raise FarhomeError('conflict', 'Helper modificato. Ricarica prima di applicare.')
            if not before['editable']:
                raise FarhomeError('read_only', 'Helper YAML o controller non ancora migrato.')
            if len(before['known_references']) > 1 and not dependencies_acknowledged:
                raise FarhomeError('dependencies_acknowledgment_required', 'Conferma i riferimenti condivisi conosciuti.')
            validate_light_options(hass, options)
            for value, previous in ((active, before['active']), (initial, before['initial'])):
                if value is not None and (not isinstance(value, str) or value not in options):
                    raise FarhomeError('validation_error', 'Selezione non presente nella lista.')
                if value is None and previous is not None and previous not in options:
                    raise FarhomeError('replacement_required', 'Scegli una nuova luce attiva e iniziale prima di rimuoverle.')
            candidate = {key: deepcopy(value) for key, value in item.items() if key != 'id'}
            candidate['options'] = deepcopy(options)
            if initial is not None:
                candidate['initial'] = initial
            changed = candidate != {key: value for key, value in item.items() if key != 'id'}
            try:
                if changed:
                    await _native_call(hass, 'input_select/update', input_select_id=item['id'], **candidate)
                after, stored = await _read(hass, entity_id, config_id)
                expected_item = {'id': item['id'], **candidate}
                if stored != expected_item or after['active'] != before['active']:
                    raise FarhomeError('partial_write', 'Modifica concorrente durante l’applicazione. Ricarica: nessun ripristino automatico è stato tentato.')
                if active is not None and active != after['active']:
                    await hass.services.async_call('input_select', 'select_option', {'entity_id': entity_id, 'option': active}, blocking=True)
                final, stored = await _read(hass, entity_id, config_id)
                if stored != expected_item or final['active'] != (active if active is not None else before['active']):
                    raise FarhomeError('partial_write', 'Verifica finale non riuscita. Ricarica lo stato del helper.')
                return final
            except FarhomeError:
                raise
            except Exception as err:
                raise FarhomeError('partial_write', 'La lista potrebbe essere già salvata; la selezione attiva non è stata confermata. Ricarica prima di riprovare.') from err


def build_selector_action(helper_id, kind, step=10, transition=.1, mode='restart'):
    if not isinstance(helper_id, str) or not HELPER.fullmatch(helper_id) or kind not in ('next', 'brightness_up', 'brightness_down') or mode not in ('single', 'restart', 'queued', 'parallel'):
        raise ValueError('invalid_selector_action')
    if type(step) not in (float, int) or not 0 < step <= 100 or type(transition) not in (float, int) or not 0 <= transition <= 3600:
        raise ValueError('invalid_selector_parameters')
    if kind == 'next':
        sequence = [{'action': 'input_select.select_next', 'target': {'entity_id': helper_id}, 'data': {'cycle': True}}]
    else:
        # Capture once at the event, then validate before resolving a dynamic target.
        sequence = [
            {'variables': {'farhome_selected_light': "{{ states('" + helper_id + "') }}"}},
            {'condition': 'template', 'value_template': "{{ farhome_selected_light is string and farhome_selected_light is match('^light[.][a-z0-9_]+$') and farhome_selected_light in (state_attr('" + helper_id + "', 'options') or []) and has_value(farhome_selected_light) }}"},
            {'action': 'light.turn_on', 'target': {'entity_id': '{{ farhome_selected_light }}'}, 'data': {'brightness_step_pct': step if kind == 'brightness_up' else -step, 'transition': transition}},
        ]
    return {'mode': mode, 'sequence': sequence}


async def apply_selector_actions(hass, config, binding, patches):
    """Explicit gesture replacements only; existing advanced feedback is opaque."""
    helper = (binding or {}).get('selector_helper')
    if not isinstance(patches, list) or len(patches) > 100:
        raise FarhomeError('validation_error', 'Gesti selettore non validi.')
    snapshot = await async_read_selector(hass, helper, config_id=config.get('id')) if patches else None
    if snapshot:
        validate_light_options(hass, snapshot['options'])
    seen = set()
    for patch in patches:
        try:
            if set(patch) != {'button', 'action', 'kind', 'step', 'transition', 'mode'}:
                raise ValueError()
            key = patch['button'], patch['action']
            if any(type(value) is not int or value < 0 for value in key) or key in seen:
                raise ValueError()
            if patch['kind'] != 'next':
                for entity_id in snapshot['options']:
                    state = hass.states.get(entity_id)
                    if not set(state.attributes.get('supported_color_modes') or []).intersection({'brightness', 'color_temp', 'hs', 'xy', 'rgb', 'rgbw', 'rgbww', 'white'}):
                        raise ValueError()
            generated = build_selector_action(helper, patch['kind'], patch['step'], patch['transition'], patch['mode'])
            config['buttons'][key[0]]['actions'][key[1]] = generated
            seen.add(key)
        except (KeyError, IndexError, TypeError, ValueError) as err:
            raise FarhomeError('validation_error', 'Gesto o capacità del selettore non validi.') from err
