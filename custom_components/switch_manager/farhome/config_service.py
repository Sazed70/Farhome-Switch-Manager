"""Coordinated configuration writes shared by Farhome and the original editor."""
from __future__ import annotations

from copy import deepcopy
import json

from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.script import async_validate_actions_config, SCRIPT_MODE_CHOICES

from ..const import DOMAIN, CONF_STORE, CONF_BLUEPRINTS, CONF_MANAGED_SWITCHES
from ..models import ManagedSwitchConfig, reconcile_buttons_with_blueprint
from .types import config_snapshot, revision


class FarhomeError(ValueError):
    def __init__(self, code, message=None):
        self.code = code
        super().__init__(f"{code}: {message}" if message else code)


def _objects(hass):
    data = hass.data[DOMAIN]
    return data['farhome'], data[CONF_STORE], data[CONF_MANAGED_SWITCHES]


def _read(hass, config_id):
    metadata, store, configs = _objects(hass)
    current = configs.get(str(config_id))
    if current is None:
        raise FarhomeError('not_found')
    snapshot = config_snapshot(current)
    # Preserve opaque wrapper fields from storage while reflecting runtime changes
    # (e.g. variables changed by switch_manager.set_variables) in the revision.
    stored = store.plain_data()['managed_switches'].get(str(config_id), {})
    for button_index, button in enumerate(snapshot['buttons']):
        old_buttons = stored.get('buttons', [])
        for action_index, action in enumerate(button['actions']):
            if button_index < len(old_buttons) and action_index < len(old_buttons[button_index].get('actions', [])):
                button['actions'][action_index] = {**deepcopy(old_buttons[button_index]['actions'][action_index]), **action}
    all_metadata = metadata.snapshot()
    binding = all_metadata['bindings'].get(str(config_id))
    controller = all_metadata['controllers'].get((binding or {}).get('device_id'), {})
    return {'config_id': str(config_id), 'config': snapshot, 'metadata': deepcopy(binding),
            'revision': revision({'config': snapshot, 'binding': binding, 'controller': controller})}


async def async_read_config(hass, config_id):
    metadata, _, _ = _objects(hass)
    async with metadata.config_lock:
        return _read(hass, config_id)


def _check_revision(hass, config_id, expected_revision):
    if expected_revision != _read(hass, config_id)['revision']:
        raise FarhomeError('conflict', 'La configurazione è stata modificata. Ricaricala prima di salvare.')


async def _validate(hass, config, *, fix_mismatch=False):
    if not isinstance(config, dict):
        raise FarhomeError('validation_error', 'Configurazione non valida.')
    data = deepcopy(config)
    blueprint_id = data.get('blueprint')
    if isinstance(blueprint_id, dict):
        blueprint_id = blueprint_id.get('id')
    blueprint = hass.data[DOMAIN][CONF_BLUEPRINTS].get(blueprint_id)
    if blueprint is None:
        raise FarhomeError('validation_error', 'Blueprint non disponibile.')
    data['blueprint'] = blueprint_id
    if not isinstance(data.get('name'), str) or not data['name'].strip() or len(data['name']) > 255:
        raise FarhomeError('validation_error', 'Nome non valido.')
    if not isinstance(data.get('identifier'), str) or len(data['identifier']) > 1024:
        raise FarhomeError('validation_error', 'Identificatore non valido.')
    data.setdefault('variables', None)
    if data['variables'] is not None and not isinstance(data['variables'], dict):
        raise FarhomeError('validation_error', 'Variabili non valide.')
    data.setdefault('rotate', 0)
    if type(data['rotate']) is not int or not 0 <= data['rotate'] <= 3:
        raise FarhomeError('validation_error', 'Rotazione non valida.')
    if fix_mismatch:
        data['buttons'] = reconcile_buttons_with_blueprint(blueprint, data.get('buttons'))
    buttons = data.get('buttons')
    if not isinstance(buttons, list) or len(buttons) != len(blueprint.buttons):
        raise FarhomeError('validation_error', 'I pulsanti non corrispondono al blueprint.')
    try:
        if len(json.dumps(data)) > 1_000_000:
            raise FarhomeError('validation_error', 'Configurazione troppo grande.')
        for button, button_blueprint in zip(buttons, blueprint.buttons, strict=True):
            actions = button.get('actions') if isinstance(button, dict) else None
            if not isinstance(actions, list) or len(actions) != len(button_blueprint.actions):
                raise FarhomeError('validation_error', 'I gesti non corrispondono al blueprint.')
            for action in actions:
                if not isinstance(action, dict) or not isinstance(action.get('sequence', []), list):
                    raise FarhomeError('validation_error', 'Sequenza non valida.')
                action.setdefault('sequence', [])
                action.setdefault('mode', 'single')
                action.setdefault('loop', False)
                action.setdefault('loop_interval', 250)
                if action['mode'] not in SCRIPT_MODE_CHOICES or type(action['loop']) is not bool or type(action['loop_interval']) is not int or not 50 <= action['loop_interval'] <= 5000:
                    raise FarhomeError('validation_error', 'Modalità o ripetizione non valida.')
                await async_validate_actions_config(hass, cv.SCRIPT_SCHEMA(action['sequence']))
    except FarhomeError:
        raise
    except Exception as err:
        raise FarhomeError('validation_error', 'Una sequenza non supera la validazione Home Assistant.') from err
    return data, blueprint


def _binding_patch(hass, config_id, binding):
    if binding is None:
        return {}
    metadata, _, _ = _objects(hass)
    try:
        metadata.patched({'bindings': {str(config_id): binding}})
    except ValueError as err:
        raise FarhomeError('validation_error', str(err)) from err
    if dr.async_get(hass).async_get(binding['device_id']) is None:
        raise FarhomeError('validation_error', 'Il dispositivo associato non esiste più.')
    return {'bindings': {str(config_id): deepcopy(binding)}}


def _reverse_patch(before, patch):
    return {namespace: {key: deepcopy(before[namespace].get(key)) for key in values} for namespace, values in patch.items()}


async def _persist(hass, config_id, data, patch, *, delete=False):
    """Two stores aren't atomic: compensate only our own revision-guarded metadata."""
    metadata, store, _ = _objects(hass)
    before = metadata.snapshot()
    changed_revision = None
    try:
        if patch:
            changed_revision = await metadata.async_update(metadata.revision, patch)
        if delete:
            await store.async_delete_config(config_id)
        else:
            await store.async_write_config(config_id, data)
    except Exception as err:
        if changed_revision is not None:
            try:
                await metadata.async_update(changed_revision, _reverse_patch(before, patch))
            except Exception as rollback_error:
                raise FarhomeError('partial_write', 'Associazioni parzialmente aggiornate. Ricarica prima di riprovare; nessuna nuova configurazione è stata attivata.') from rollback_error
        raise FarhomeError('persistence_failed', 'Salvataggio non riuscito. La configurazione in esecuzione è invariata.') from err


async def _replace_runtime(hass, config_id, data, blueprint):
    _, store, configs = _objects(hass)
    old = configs.get(str(config_id))
    candidate = None
    try:
        candidate = ManagedSwitchConfig(hass, blueprint, str(config_id), data)
        if old is not None:
            old.stop()
        configs[str(config_id)] = candidate
        await candidate.start()
        if old is not None:
            old.unload()
    except Exception as err:
        # A persisted configuration which cannot start must remain explicitly disabled.
        if candidate is not None:
            candidate.setEnabled(False)
            candidate.stop()
        if old is not None:
            old.setEnabled(False)
            old.stop()
        disabled = {**data, 'enabled': False}
        try:
            await store.async_write_config(config_id, disabled)
        except Exception:
            pass
        raise FarhomeError('partial_write', 'Configurazione salvata, ma non avviata. È necessario ricaricare e verificarla.') from err


async def _save_locked(hass, config, binding, expected_revision, *, fix_mismatch=False):
    metadata, store, configs = _objects(hass)
    config_id = config.get('id')
    existing = config_id is not None
    if existing:
        config_id = str(config_id)
        _check_revision(hass, config_id, expected_revision)
    else:
        config_id = store.get_available_id()
    data, blueprint = await _validate(hass, config, fix_mismatch=fix_mismatch)
    data['id'] = config_id
    patch = _binding_patch(hass, config_id, binding)
    old = configs.get(config_id)
    old_binding = metadata.snapshot()['bindings'].get(config_id)
    physical_change = old is not None and (data['identifier'] != old.identifier or blueprint.id != getattr(old.blueprint, 'id', old.blueprint) or (binding is not None and (binding.get('device_id'), binding.get('selector_helper')) != ((old_binding or {}).get('device_id'), (old_binding or {}).get('selector_helper'))))
    data['enabled'] = bool(old and old.enabled and not physical_change)
    await _persist(hass, config_id, data, patch)
    await _replace_runtime(hass, config_id, data, blueprint)
    return _read(hass, config_id)


async def async_save_config(hass, config, metadata, expected_revision, *, fix_mismatch=False):
    store, _, _ = _objects(hass)
    async with store.config_lock:
        return await _save_locked(hass, config, metadata, expected_revision, fix_mismatch=fix_mismatch)


async def async_set_enabled(hass, config_id, enabled, expected_revision, conflict_check=False):
    metadata, store, configs = _objects(hass)
    async with metadata.config_lock:
        _check_revision(hass, config_id, expected_revision)
        current = _read(hass, config_id)
        if not enabled:
            # Disabling must also work for a missing/mismatched blueprint. Keep
            # its original stored buttons so this recovery action loses no data.
            data = {**current['config'], **store.plain_data()['managed_switches'].get(str(config_id), {})}
            if isinstance(data['blueprint'], dict):
                data['blueprint'] = data['blueprint']['id']
            data['enabled'] = False
            await _persist(hass, str(config_id), data, {})
            configs[str(config_id)].setEnabled(False)
            await configs[str(config_id)].start()
            return _read(hass, config_id)
        data, blueprint = await _validate(hass, current['config'])
        patch = {}
        if enabled:
            binding = current['metadata'] or {}
            if not binding.get('verified') or not conflict_check or not data['identifier'] or dr.async_get(hass).async_get(binding.get('device_id')) is None:
                raise FarhomeError('activation_blocked', 'Verifica dispositivo, blueprint e gestori concorrenti prima di attivare.')
            controller = metadata.snapshot()['controllers'].get(binding['device_id'], {})
            for entity_id in controller.get('external_automations', []):
                state = hass.states.get(entity_id)
                if state is None or state.state != 'off':
                    raise FarhomeError('activation_blocked', 'Un’automazione esterna risulta attiva o non verificabile.')
            patch = {'bindings': {str(config_id): {**binding, 'conflicts_checked': True}}, 'controllers': {binding['device_id']: {**controller, 'management': 'unknown'}}}
        data['enabled'] = bool(enabled)
        await _persist(hass, str(config_id), data, patch)
        await _replace_runtime(hass, str(config_id), data, blueprint)
        return _read(hass, config_id)


async def async_delete_config(hass, config_id, expected_revision):
    metadata, _, configs = _objects(hass)
    async with metadata.config_lock:
        _check_revision(hass, config_id, expected_revision)
        await _persist(hass, str(config_id), None, {'bindings': {str(config_id): None}}, delete=True)
        configs.pop(str(config_id)).unload()
        return {'deleted': str(config_id)}


async def async_duplicate_config(hass, config_id, expected_revision):
    metadata, _, _ = _objects(hass)
    async with metadata.config_lock:
        _check_revision(hass, config_id, expected_revision)
        data = _read(hass, config_id)['config']
        data.update(id=None, name=f"{data['name']} (Copy)", identifier='', enabled=False)
        return await _save_locked(hass, data, None, None)
