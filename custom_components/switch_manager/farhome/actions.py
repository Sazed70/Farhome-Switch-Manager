"""Server-side quick action construction from actual target capabilities."""
from __future__ import annotations

import math
import re
from homeassistant.components.fan.const import FanEntityFeature
from homeassistant.components.light.const import LightEntityFeature

ENTITY_ID = re.compile(r'^(light|fan|switch|scene|script)\.[a-z0-9_]+$')
AREA_ID = re.compile(r'^[a-z0-9_]+$')
MODES = {'single', 'restart', 'queued', 'parallel'}
COLOR_MODES = ('hs', 'xy', 'rgb', 'rgbw', 'rgbww')
KINDS = {
    'light': {'toggle': 'toggle', 'on': 'turn_on', 'off': 'turn_off', 'increase': 'turn_on', 'decrease': 'turn_on'},
    'fan': {'toggle': 'toggle', 'on': 'turn_on', 'off': 'turn_off', 'increase': 'increase_speed', 'decrease': 'decrease_speed'},
    'switch': {'toggle': 'toggle', 'on': 'turn_on', 'off': 'turn_off'},
    'scene': {'activate': 'turn_on'}, 'script': {'run': 'turn_on'},
}


def _number(value, minimum=0, maximum=math.inf):
    return type(value) in (int, float) and math.isfinite(value) and minimum <= value <= maximum


def validate_quick_action(hass, value):
    if not isinstance(value, dict):
        raise ValueError('invalid_quick_action')
    domain, kind = value.get('domain'), value.get('kind')
    entity_id, area_id = value.get('entity_id'), value.get('area_id')
    if not isinstance(domain, str) or domain not in KINDS or not isinstance(kind, str) or kind not in KINDS[domain]:
        raise ValueError('invalid_quick_action')
    if (entity_id is not None and area_id is not None) or (entity_id is None and area_id is None):
        raise ValueError('invalid_quick_action')
    service = KINDS[domain][kind]
    if not hass.services.has_service(domain, service):
        raise ValueError('unknown_service')
    allowed = {'domain', 'kind', 'entity_id', 'area_id', 'mode', 'loop', 'loop_interval', 'alias', 'service_key', 'data_present'}
    if domain == 'light':
        allowed.add('transition')
    if kind in ('increase', 'decrease'):
        allowed.add('step')
    if domain == 'light' and kind in ('on', 'toggle'):
        allowed.update(('brightness_pct', 'color_temp_kelvin'))
        if area_id is None:
            allowed.add('rgb_color')
    if domain == 'fan' and kind == 'on' and area_id is None:
        allowed.add('percentage')
    if set(value) - allowed or {'rgb_color', 'color_temp_kelvin'} <= value.keys():
        raise ValueError('invalid_quick_parameters')
    if area_id is not None:
        if not isinstance(area_id, str) or not AREA_ID.fullmatch(area_id):
            raise ValueError('invalid_quick_action')
        from homeassistant.helpers import area_registry as ar
        area = ar.async_get(hass).async_get_area(area_id)
        if area is None:
            raise ValueError('unknown_target')
        if domain not in ('light', 'fan', 'switch') or kind not in ('toggle', 'on', 'off'):
            raise ValueError('unsupported_area_action')
    else:
        if not isinstance(entity_id, str) or not ENTITY_ID.fullmatch(entity_id) or not entity_id.startswith(domain + '.'):
            raise ValueError('invalid_quick_action')
        entity = hass.states.get(entity_id)
        if entity is None:
            raise ValueError('unknown_target')
        features = entity.attributes.get('supported_features', 0)
        features = features if type(features) is int else 0
        color_modes = entity.attributes.get('supported_color_modes', [])
        color_modes = color_modes if isinstance(color_modes, (list, tuple, set)) else ()
        brightness = any(mode in color_modes for mode in ('brightness', 'color_temp', 'white', *COLOR_MODES))
        if domain == 'fan':
            if (kind in ('increase', 'decrease') or 'percentage' in value) and not features & FanEntityFeature.SET_SPEED:
                raise ValueError('unsupported_speed')
            if kind in ('on', 'toggle') and not features & FanEntityFeature.TURN_ON:
                raise ValueError('unsupported_turn_on')
            if kind in ('off', 'toggle') and not features & FanEntityFeature.TURN_OFF:
                raise ValueError('unsupported_turn_off')
        if domain == 'light':
            if (kind in ('increase', 'decrease') or 'brightness_pct' in value) and not brightness:
                raise ValueError('unsupported_brightness')
            if 'transition' in value and not features & LightEntityFeature.TRANSITION:
                raise ValueError('unsupported_transition')
            if 'color_temp_kelvin' in value:
                kelvin = value['color_temp_kelvin']
                if 'color_temp' not in color_modes or not _number(kelvin, 1) or not entity.attributes.get('min_color_temp_kelvin', 0) <= kelvin <= entity.attributes.get('max_color_temp_kelvin', math.inf):
                    raise ValueError('unsupported_color_temperature')
            if 'rgb_color' in value and not any(mode in color_modes for mode in COLOR_MODES):
                raise ValueError('unsupported_color')
    mode = value.get('mode', 'single')
    if not isinstance(mode, str) or mode not in MODES:
        raise ValueError('invalid_mode')
    if 'loop' in value and type(value['loop']) is not bool:
        raise ValueError('invalid_loop')
    if 'loop_interval' in value and (type(value['loop_interval']) is not int or not 50 <= value['loop_interval'] <= 5000):
        raise ValueError('invalid_loop_interval')
    if value.get('service_key', 'action') not in ('action', 'service'):
        raise ValueError('invalid_service_key')
    if 'alias' in value and (not isinstance(value['alias'], str) or len(value['alias']) > 1024):
        raise ValueError('invalid_alias')
    if 'data_present' in value and type(value['data_present']) is not bool:
        raise ValueError('invalid_data_flag')
    data = {}
    if kind in ('increase', 'decrease'):
        step = value.get('step')
        if domain == 'light' and step is None:
            raise ValueError('missing_step')
        if step is not None:
            if not _number(step, 0, 100) or step == 0:
                raise ValueError('invalid_step')
            data['brightness_step_pct' if domain == 'light' else 'percentage_step'] = -step if domain == 'light' and kind == 'decrease' else step
    for key in ('transition', 'brightness_pct', 'color_temp_kelvin', 'percentage'):
        if key in value:
            if not _number(value[key], 1 if key == 'color_temp_kelvin' else 0, 100 if key in ('brightness_pct', 'percentage') else math.inf):
                raise ValueError('invalid_parameter')
            data[key] = value[key]
    if 'rgb_color' in value:
        rgb = value['rgb_color']
        if not isinstance(rgb, list) or len(rgb) != 3 or not all(type(channel) is int and 0 <= channel <= 255 for channel in rgb):
            raise ValueError('invalid_parameter')
        data['rgb_color'] = rgb.copy()
    target = {'area_id': area_id} if area_id is not None else {'entity_id': entity_id}
    action = {value.get('service_key', 'action'): f'{domain}.{service}', 'target': target}
    if data or value.get('data_present'):
        action['data'] = data
    if 'alias' in value:
        action['alias'] = value['alias']
    result = {'mode': mode, 'sequence': [action]}
    for key in ('loop', 'loop_interval'):
        if key in value:
            result[key] = value[key]
    return result


def apply_quick_actions(hass, config, patches):
    if not isinstance(patches, list) or len(patches) > 5000:
        raise ValueError('invalid_quick_patch')
    seen = set()
    for patch in patches:
        if not isinstance(patch, dict) or set(patch) != {'button', 'action', 'value'}:
            raise ValueError('invalid_quick_patch')
        button, action = patch['button'], patch['action']
        if type(button) is not int or type(action) is not int or button < 0 or action < 0 or (button, action) in seen:
            raise ValueError('invalid_quick_index')
        try:
            config['buttons'][button]['actions'][action] = validate_quick_action(hass, patch['value'])
        except (KeyError, IndexError, TypeError) as err:
            raise ValueError('invalid_quick_index') from err
        seen.add((button, action))
