"""Coordinated configuration writes shared by Farhome and the original editor."""
from __future__ import annotations

from copy import deepcopy
import json

from homeassistant.components import automation
from homeassistant.helpers import config_validation as cv, device_registry as dr
from homeassistant.helpers.script import async_validate_actions_config, SCRIPT_MODE_CHOICES

from ..const import DOMAIN, CONF_STORE, CONF_BLUEPRINTS, CONF_MANAGED_SWITCHES
from ..models import ManagedSwitchConfig, reconcile_buttons_with_blueprint, uses_zigbee2mqtt_action_topic
from .types import config_snapshot, revision
from .actions import apply_quick_actions


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
    stored = store.plain_config(config_id) if hasattr(store, 'plain_config') else store.plain_data()['managed_switches'].get(str(config_id), {})
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
    previous = metadata.snapshot()['bindings'].get(str(config_id), {})
    helper = binding.get('selector_helper')
    if helper and helper != previous.get('selector_helper'):
        from .selector import HELPER, validate_light_options

        current = hass.data[DOMAIN][CONF_MANAGED_SWITCHES].get(str(config_id))
        controller = metadata.snapshot()['controllers'].get(binding['device_id'], {})
        if current and current.enabled and (previous.get('device_id') != binding['device_id'] or not previous.get('verified') or not previous.get('conflicts_checked') or controller.get('management') == 'external'):
            raise FarhomeError('activation_blocked', 'Disabilita la configurazione prima di collegare un helper.')
        state = hass.states.get(helper) if HELPER.fullmatch(helper) else None
        if state is None:
            raise FarhomeError('validation_error', 'Helper non disponibile.')
        validate_light_options(hass, state.attributes.get('options'))
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


async def _save_locked(hass, config, binding, expected_revision, *, fix_mismatch=False, quick_actions=None, selector_actions=None):
    metadata, store, configs = _objects(hass)
    if not isinstance(config, dict):
        raise FarhomeError('validation_error', 'Configurazione non valida.')
    config = deepcopy(config)
    config_id = config.get('id')
    existing = config_id is not None
    if existing:
        config_id = str(config_id)
        _check_revision(hass, config_id, expected_revision)
    else:
        config_id = store.get_available_id()
    if selector_actions:
        from .selector import apply_selector_actions
        effective_binding = binding if binding is not None else metadata.snapshot()['bindings'].get(config_id)
        await apply_selector_actions(hass, config, effective_binding, selector_actions)
    if quick_actions is not None:
        try:
            apply_quick_actions(hass, config, quick_actions)
        except ValueError as err:
            raise FarhomeError('validation_error', str(err)) from err
    data, blueprint = await _validate(hass, config, fix_mismatch=fix_mismatch)
    for patch in quick_actions or []:
        if patch['value'].get('loop') and blueprint.buttons[patch['button']].actions[patch['action']].release_index is None:
            raise FarhomeError('validation_error', 'Questo gesto non espone un evento di rilascio.')
    data['id'] = config_id
    patch = _binding_patch(hass, config_id, binding)
    old = configs.get(config_id)
    old_binding = metadata.snapshot()['bindings'].get(config_id)
    source_change = old is not None and (
        data['identifier'] != old.identifier or blueprint.id != getattr(old.blueprint, 'id', old.blueprint)
        or (binding is not None and binding.get('device_id') != (old_binding or {}).get('device_id'))
    )
    helper_change = binding is not None and binding.get('selector_helper') != (old_binding or {}).get('selector_helper')
    if source_change and (effective_binding := binding if binding is not None else old_binding):
        patch = {'bindings': {config_id: {**effective_binding, 'verified': False, 'conflicts_checked': False}}}
    data['enabled'] = bool(old and old.enabled and not source_change and not helper_change)
    await _persist(hass, config_id, data, patch)
    await _replace_runtime(hass, config_id, data, blueprint)
    return _read(hass, config_id)


async def async_save_config(hass, config, metadata, expected_revision, *, fix_mismatch=False, quick_actions=None, selector_actions=None):
    store, _, _ = _objects(hass)
    async with store.config_lock:
        return await _save_locked(hass, config, metadata, expected_revision, fix_mismatch=fix_mismatch, quick_actions=quick_actions, selector_actions=selector_actions)


def _mqtt_topics(blueprint, identifier):
    if not identifier or not getattr(blueprint, 'is_mqtt', False):
        return set()
    if uses_zigbee2mqtt_action_topic(blueprint):
        return {identifier, identifier.removesuffix('/action')}
    return {identifier}


def _uses_controller(triggers, topics, device_id):
    if isinstance(triggers, list):
        return any(_uses_controller(trigger, topics, device_id) for trigger in triggers)
    if not isinstance(triggers, dict) or triggers.get('enabled') is False:
        return False
    platform = triggers.get('trigger', triggers.get('platform'))
    if platform == 'mqtt':
        topic = triggers.get('topic')
        return isinstance(topic, str) and topic in topics
    if platform == 'device':
        return triggers.get('device_id') == device_id
    return _uses_controller(triggers.get('triggers'), topics, device_id)


def _has_activation_conflict(hass, configs, config_id, blueprint, identifier, device_id):
    topics = _mqtt_topics(blueprint, identifier)
    for key, other in configs.items():
        if str(key) != str(config_id) and other.enabled and (
            topics & _mqtt_topics(other.blueprint, other.identifier)
            or (other.identifier == identifier and getattr(other.blueprint, 'event_type', None) == blueprint.event_type)
        ):
            return True
    # Loaded automations expose raw_config through Home Assistant's automation/config API.
    component = hass.data.get(getattr(automation, 'DATA_COMPONENT', automation.DOMAIN))
    for entity in getattr(component, 'entities', ()):
        if not hass.states.is_state(entity.entity_id, 'on'):
            continue
        raw = entity.raw_config or {}
        if _uses_controller(raw.get('triggers', raw.get('trigger')), topics, device_id):
            return True
    return False


async def _matches_detected_controller(hass, device_id, blueprint_id, identifier):
    from .inventory import async_snapshot

    inventory = await async_snapshot(hass)
    if inventory['warnings']:
        return False
    controller = next((item for item in inventory['controllers'] if item['device_id'] == device_id), {})
    suggestion = controller.get('blueprint_suggestion') or {}
    return (suggestion.get('reason') in ('model', 'mode', 'gestures')
            and suggestion.get('id') == blueprint_id and suggestion.get('identifier') == identifier)


async def async_set_enabled(hass, config_id, enabled, expected_revision, conflict_check=False, *, manual_confirmation=None):
    metadata, store, configs = _objects(hass)
    async with metadata.config_lock:
        _check_revision(hass, config_id, expected_revision)
        current = _read(hass, config_id)
        if not enabled:
            # Disabling must also work for a missing/mismatched blueprint. Keep
            # its original stored buttons so this recovery action loses no data.
            stored = store.plain_config(config_id) if hasattr(store, 'plain_config') else store.plain_data()['managed_switches'].get(str(config_id), {})
            data = {**current['config'], **stored}
            if isinstance(data['blueprint'], dict):
                data['blueprint'] = data['blueprint']['id']
            data['enabled'] = False
            await _persist(hass, str(config_id), data, {})
            configs[str(config_id)].setEnabled(False)
            await configs[str(config_id)].start()
            return _read(hass, config_id)
        data, blueprint = await _validate(hass, current['config'])
        binding = current['metadata'] or {}
        device_id = binding.get('device_id')
        if not device_id or not data['identifier'].strip():
            raise FarhomeError('activation_blocked', 'Verifica dispositivo, blueprint e identificatore prima di attivare.')
        controller = metadata.snapshot()['controllers'].get(device_id, {})
        external = controller.get('external_automations', [])
        if manual_confirmation is None:
            if not binding.get('verified') or not conflict_check:
                raise FarhomeError('activation_blocked', 'Verifica dispositivo, blueprint e gestori concorrenti prima di attivare.')
        elif not manual_confirmation:
            matched = controller.get('management') != 'external' and not external and await _matches_detected_controller(
                hass, device_id, blueprint.id, data['identifier'],
            )
        # Check active handlers after the awaited inventory read, just before committing.
        if dr.async_get(hass).async_get(device_id) is None:
            raise FarhomeError('activation_blocked', 'Il dispositivo associato non esiste più.')
        if any(not hass.states.is_state(entity_id, 'off') for entity_id in external):
            raise FarhomeError('activation_blocked' if manual_confirmation is None else 'activation_conflict',
                               'Un’automazione esterna risulta attiva o non verificabile.')
        if _has_activation_conflict(hass, configs, config_id, blueprint, data['identifier'], device_id):
            raise FarhomeError('activation_conflict', 'Un altro gestore attivo usa questi eventi.')
        if manual_confirmation is False and not matched:
            raise FarhomeError('activation_confirmation_required')
        patch = {'bindings': {str(config_id): {**binding, 'verified': True, 'conflicts_checked': True}},
                 'controllers': {device_id: {**controller, 'management': 'unknown'}}}
        data['enabled'] = True
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
