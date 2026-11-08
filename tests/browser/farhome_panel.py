"""Acceptance tests exercise the compiled product components, no live HA."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
from threading import Thread
from playwright.sync_api import sync_playwright, expect

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

root = Path(__file__).resolve().parents[2]
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        executable = os.environ.get('FARHOME_BROWSER')
        if not executable and Path('C:/Program Files/Google/Chrome Beta/Application/chrome.exe').is_file():
            executable = 'C:/Program Files/Google/Chrome Beta/Application/chrome.exe'
        browser = p.chromium.launch(headless=True, executable_path=executable, timeout=15000)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.set_default_timeout(5000)
        page.goto(f'http://127.0.0.1:{server.server_port}/tests/browser/harness.html')
        page.wait_for_function('window.ready === true')
        expect(page.get_by_role('heading', name='Pulsanti', exact=True)).to_be_visible(timeout=2000)
        page.get_by_role('button', name='Vuota', exact=True).click()
        expect(page.get_by_text('Nessun pulsante in questa stanza.')).to_be_visible()
        page.get_by_role('button', name='Senza stanza', exact=True).first.click()
        expect(page.locator('[data-device="none"]')).to_be_visible()
        page.evaluate("""() => {
            const device = fixture.controllers.find(d => d.device_id === 'none');
            device.blueprint_suggestion = {
                id:'synthetic',name:'Synthetic knob',reason:'mode_unknown',mode:'event',identifier:'z2m/Room/Knob/action',
                alternative:{id:'synthetic-command',name:'Synthetic command knob',mode:'command',identifier:'z2m/Room/Knob'}
            };
            return panel.refresh();
        }""")
        page.locator('[data-device="none"]').click()
        expect(page.get_by_role('heading', name='Blueprint suggerito')).to_be_visible()
        expect(page.get_by_text('Synthetic knob', exact=True)).to_be_visible()
        expect(page.get_by_text('Synthetic command knob', exact=True)).to_be_visible()
        expect(page.get_by_text('La modalità Zigbee2MQTT non è ancora disponibile.')).to_be_visible()
        page.evaluate("panel.hass = {...testHass, language:'en-GB'}")
        expect(page.get_by_role('heading', name='Suggested blueprint', exact=True)).to_be_visible()
        expect(page.get_by_role('searchbox', name='Search blueprints')).to_be_visible()
        expect(page.get_by_role('button', name='Use suggestion · Synthetic knob', exact=True)).to_be_enabled()
        page.evaluate("panel.hass = testHass")
        catalog = page.get_by_label('Modello / blueprint')
        expect(catalog).to_have_value('')
        search = page.get_by_role('searchbox', name='Cerca blueprint')
        expect(catalog.locator('option:not([value=""])')).to_have_text([
            'Acme switch · Z-Wave JS', 'Synthetic command knob · Zigbee2MQTT', 'Synthetic knob · Zigbee2MQTT',
        ])
        search.fill('  MX42  ')
        expect(catalog.locator('option:not([value=""])')).to_have_text(['Acme switch · Z-Wave JS'])
        search.fill('zzz')
        expect(page.get_by_text('Nessun blueprint corrispondente.')).to_be_visible()
        page.get_by_role('button', name='Usa suggerimento · Synthetic knob', exact=True).click()
        expect(catalog).to_have_value('synthetic')
        expect(page.get_by_label('Nome', exact=True)).to_have_value('Senza stanza')
        identifier = page.get_by_label('Identificatore eventi', exact=True)
        expect(identifier).to_have_value('z2m/Room/Knob/action')
        search.fill('MX42')
        expect(catalog).to_have_value('synthetic')
        catalog.select_option('acme-mx42')
        expect(identifier).to_have_value('')
        page.get_by_role('button', name='Usa suggerimento · Synthetic command knob', exact=True).click()
        expect(catalog).to_have_value('synthetic-command')
        expect(identifier).to_have_value('z2m/Room/Knob')
        assert not page.evaluate("calls.some(x=>x.type.endsWith('/config/save'))")
        page.get_by_role('button', name='Studio', exact=True).click()
        page.get_by_role('button', name='Scarta', exact=True).click()
        page.locator('[data-device="long"]').click()
        expect(page.get_by_label('Nome', exact=True)).to_have_value('')
        expect(catalog).to_have_value('')
        expect(search).to_have_value('')
        expect(identifier).to_have_value('')
        page.locator('[data-device="many"]').click()
        expect(page.get_by_label('Configurazione')).to_be_visible()
        expect(page.locator('farhome-device-editor [data-gesture]')).to_have_count(0)
        page.locator('[data-device="knob"]').click()
        expect(page.locator('[data-gesture]')).to_have_count(5)
        expect(page.get_by_label('Modalità', exact=True)).to_have_value('restart')
        expect(page.locator('[data-gesture="0:0"]')).to_have_text('Tasto 1 · Pressione singola')
        expect(page.get_by_label('Modalità', exact=True).locator('option:checked')).to_have_text('Riavvia')
        page.evaluate("panel.hass = {...testHass, language:'en-GB'}")
        expect(page.get_by_role('heading', name='Buttons', exact=True)).to_be_visible()
        expect(page.locator('[data-gesture="0:0"]')).to_have_text('Button 1 · press')
        expect(page.get_by_label('Mode', exact=True)).to_have_value('restart')
        expect(page.get_by_label('Mode', exact=True).locator('option:checked')).to_have_text('Restart')
        page.evaluate("panel.hass = {...testHass, language:'it-IT'}")
        expect(page.get_by_role('heading', name='Pulsanti', exact=True)).to_be_visible()
        page.locator('[data-gesture="0:2"]').click()
        expect(page.get_by_text('Sequenza avanzata', exact=True)).to_be_visible()
        original = page.evaluate("structuredClone(configs['1'].buttons[0].actions[2])")
        page.locator('[data-gesture="0:1"]').click()
        page.get_by_role('button', name='Configura azione rapida', exact=True).click()
        page.get_by_label('Tipo di destinatario').select_option('fan')
        expect(page.get_by_label('Destinatario', exact=True)).to_be_visible()
        page.get_by_label('Destinatario', exact=True).select_option('fan.fixed')
        assert 'Aumenta' not in page.get_by_label('Funzione', exact=True).inner_text()
        assert page.get_by_text('Passo luminosità (%)', exact=True).count() == 0
        page.get_by_label('Destinatario', exact=True).select_option('fan.variable')
        page.get_by_label('Funzione', exact=True).select_option('on')
        speed = page.locator('farhome-device-editor input[type="number"]:visible')
        speed.fill('50')
        target = page.get_by_label('Destinatario', exact=True)
        target.select_option('area:studio')
        expect(speed).to_have_count(0)
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        area_action = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).at(-1).quick_actions[0].value")
        assert area_action['area_id'] == 'studio' and 'percentage' not in area_action
        target.select_option('fan.variable')
        page.get_by_label('Funzione', exact=True).select_option('increase')
        page.get_by_label('Passo velocità (%)').fill('15')
        page.evaluate('window.failSave=true')
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('Ricarica')
        page.evaluate("panel.hass = {...testHass, language:'en'}")
        expect(page.get_by_role('alert')).to_contain_text('Reload')
        page.evaluate("panel.hass = testHass")
        expect(page.get_by_label('Passo velocità (%)')).to_have_value('15')
        page.evaluate('window.failSave=false;window.delaySave=true')
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_role('button', name='Salva gesti', exact=True)).to_be_disabled()
        page.evaluate('releaseSave()')
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        saved = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).at(-1)")
        assert saved['config']['buttons'][0]['actions'][2] == original
        assert saved['quick_actions'][0]['value']['domain'] == 'fan'
        assert saved['quick_actions'][0]['value']['step'] == 15
        page.get_by_label('Passo velocità (%)').fill('20')
        page.get_by_role('button', name='Vuota', exact=True).click()
        expect(page.get_by_role('dialog')).to_be_visible()
        page.get_by_role('button', name='Resta', exact=True).click()
        expect(page.get_by_label('Passo velocità (%)')).to_have_value('20')
        page.get_by_role('button', name='Vuota', exact=True).click()
        page.get_by_role('button', name='Scarta', exact=True).click()
        expect(page.get_by_text('Nessun pulsante in questa stanza.')).to_be_visible()
        page.get_by_role('button', name='Da associare', exact=True).click()
        page.get_by_label('Dispositivo da associare').select_option('knob')
        page.get_by_role('button', name='Collega configurazione', exact=True).click()
        page.get_by_role('button', name='Studio', exact=True).click()
        page.get_by_role('button', name='Aggiungi pulsante', exact=True).click()
        page.get_by_label('Dispositivo registrato').select_option('manual')
        page.get_by_role('button', name='Aggiungi alla lista', exact=True).click()
        expect(page.locator('[data-device="manual"]')).to_be_visible()
        page.locator('[data-device="external"]').click()
        expect(page.get_by_role('button', name='Prepara configurazione Farhome')).to_be_visible()
        expect(page.get_by_role('button', name='Salva gesti', exact=True)).to_have_count(0)
        assert page.evaluate('window.xss') is None
        page.locator('[data-device="knob"]').click()
        # Helper edits have their own draft and commit, independent of gestures.
        page.get_by_text('Selettore di luci', exact=True).first.click()
        page.get_by_label('Helper luci').select_option('input_select.lights')
        page.get_by_role('button', name='Collega helper esistente', exact=True).click()
        page.evaluate('window.delaySave=false')
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        expect(page.locator('farhome-selector-editor')).to_be_visible()
        page.get_by_text('Associazione e attivazione', exact=True).click()
        expect(page.get_by_role('checkbox', name='Ho verificato dispositivo', exact=False)).to_have_count(0)
        expect(page.get_by_role('checkbox', name='Ho verificato che non esistono', exact=False)).to_have_count(0)
        page.get_by_role('button', name='Attiva configurazione', exact=True).click()
        expect(page.get_by_role('button', name='Disattiva configurazione', exact=True)).to_be_visible()
        assert page.evaluate("calls.find(x=>x.type.endsWith('/config/enabled')).manual_confirmation") is False
        page.get_by_role('button', name='Disattiva configurazione', exact=True).click()
        page.evaluate('window.requireActivationConfirmation=true')
        page.get_by_role('button', name='Attiva configurazione', exact=True).click()
        dialog = page.get_by_role('dialog', name='Verifica prima di attivare')
        expect(dialog).to_be_visible()
        dialog.get_by_role('button', name='Annulla', exact=True).click()
        assert page.evaluate("configs['1'].enabled") is False
        page.get_by_role('button', name='Attiva configurazione', exact=True).click()
        dialog.get_by_role('button', name='Conferma e attiva', exact=True).click()
        expect(page.get_by_role('button', name='Disattiva configurazione', exact=True)).to_be_visible()
        page.get_by_role('button', name='Sposta giù Scrivania', exact=True).focus()
        page.keyboard.press('Enter')
        page.get_by_label('Luce da aggiungere').select_option('light.extra')
        page.get_by_role('button', name='Aggiungi luce', exact=True).click()
        page.get_by_role('button', name='Rimuovi Extra', exact=True).click()
        page.get_by_role('button', name='Applica elenco', exact=True).click()
        expect(page.get_by_text('Elenco applicato', exact=True)).to_be_visible()
        helper_save = page.evaluate("calls.filter(x=>x.type.endsWith('/selector/update')).at(-1)")
        assert helper_save['options'] == ['light.ceiling', 'light.desk']
        assert helper_save['active'] is None
        page.locator('[data-gesture="0:0"]').click()
        page.get_by_role('button', name='Usa selettore per questo gesto', exact=True).click()
        page.get_by_role('button', name='Conferma gesto selettore', exact=True).click()
        expect(page.get_by_label('Modalità', exact=True)).to_have_value('queued')
        expect(page.get_by_label('Modalità', exact=True)).to_be_disabled()
        page.get_by_role('button', name='Sposta su Scrivania', exact=True).click()
        count = page.evaluate("calls.filter(x=>x.type.endsWith('/selector/update')).length")
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        assert page.evaluate("calls.filter(x=>x.type.endsWith('/selector/update')).length") == count
        latest = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).at(-1)")
        assert latest['config']['buttons'][0]['actions'][2] == original
        assert latest['config']['buttons'][0]['actions'][3]['sequence'] == []
        assert len(latest['selector_actions']) == 1
        page.evaluate("window.helperFailure='partial_write'")
        page.get_by_role('button', name='Applica elenco', exact=True).click()
        expect(page.locator('farhome-selector-editor').get_by_role('alert')).to_contain_text('Ricarica')
        expect(page.locator('farhome-selector-editor [data-option="light.desk"]')).to_be_visible()
        page.evaluate('window.helperFailure=null')
        page.get_by_role('button', name='Ricarica elenco', exact=True).click()
        page.get_by_role('button', name='Rimuovi Soffitto', exact=True).click()
        page.get_by_role('button', name='Rimuovi Scrivania', exact=True).click()
        expect(page.get_by_role('button', name='Applica elenco', exact=True)).to_be_disabled()
        assert page.get_by_label('Luce da aggiungere').locator('option[value^="fan."]').count() == 0
        page.get_by_role('button', name='Ricarica elenco', exact=True).click()
        page.evaluate("helper.origin='yaml_or_unknown';helper.editable=false")
        page.get_by_role('button', name='Ricarica elenco', exact=True).click()
        expect(page.get_by_text('Definito in YAML o origine non risolta: elenco in sola lettura.')).to_be_visible()
        expect(page.get_by_role('button', name='Applica elenco', exact=True)).to_have_count(0)
        page.evaluate("""() => {
            helper.origin='ui';helper.editable=true;helper.active='unknown';
            helper.known_references.push({type:'automation',id:'automation.shared'});
            testHass.states[helper.entity_id].state='unknown';
        }""")
        page.get_by_role('button', name='Ricarica elenco', exact=True).click()
        expect(page.get_by_text('Destinatario attivo non disponibile')).to_be_visible()
        page.get_by_role('button', name='Sposta giù Soffitto', exact=True).click()
        expect(page.get_by_role('button', name='Applica elenco', exact=True)).to_be_disabled()
        page.get_by_label('Luce attiva').select_option('light.desk')
        page.get_by_label('Ho verificato le dipendenze note di questo helper.').check()
        page.evaluate("window.helperFailure='conflict'")
        page.get_by_role('button', name='Applica elenco', exact=True).click()
        expect(page.locator('farhome-selector-editor').get_by_role('alert')).to_contain_text('Ricarica')
        page.evaluate('window.helperFailure=null')
        page.get_by_role('button', name='Ricarica elenco', exact=True).click()
        for theme in ('light', 'dark'):
            page.evaluate("theme=>document.body.classList.toggle('dark',theme==='dark')", theme)
            for width in (1440, 390, 320):
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (theme, width)
                output = root / '.superpowers/sdd/2026-11-06-farhome-pulsanti'
                output.mkdir(parents=True, exist_ok=True)
                page.screenshot(path=str(output / f'product-{theme}-{width}.png'), full_page=True)
        page.evaluate('window.failRead=true;mount()')
        expect(page.get_by_role('alert')).to_contain_text('Lettura non riuscita')
        page.evaluate('window.failRead=false')
        page.get_by_role('button', name='Riprova', exact=True).click()
        expect(page.locator('[data-device="knob"]')).to_be_visible()
        page.set_viewport_size({'width': 1440, 'height': 1000})
        page.goto(f'http://127.0.0.1:{server.server_port}/tests/browser/harness.html')
        expect(page.locator('[data-device="knob"]')).to_be_visible()
        page.evaluate("""() => {
            const config = configs['1'];
            config.blueprint.buttons[0].actions[0].release_index = 1;
            config.buttons[0].actions[0] = {
                mode: 'restart', loop: true, loop_interval: 800,
                sequence: [{action: 'light.turn_on', target: {entity_id: 'light.desk'},
                            data: {brightness_step_pct: 15, transition: 0.5}}]
            };
            fixture.metadata.bindings['1'].selector_helper = 'input_select.lights';
        }""")
        page.locator('[data-device="knob"]').click()
        page.get_by_label('Destinatario', exact=True).select_option('light.extra')
        expect(page.get_by_label('Passo luminosità (%)')).to_have_value('15')
        page.get_by_label('Funzione', exact=True).select_option('decrease')
        page.get_by_role('button', name='Usa selettore per questo gesto', exact=True).click()
        page.locator('[data-gesture="0:2"]').click()
        expect(page.get_by_role('button', name='Conferma gesto selettore', exact=True)).to_have_count(0, timeout=1500)
        page.locator('[data-gesture="0:0"]').click()
        page.get_by_role('button', name='Usa selettore per questo gesto', exact=True).click()
        page.evaluate('window.delaySave=true')
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        page.wait_for_function("typeof window.releaseSave === 'function'")
        confirm_disabled = page.get_by_role('button', name='Conferma gesto selettore', exact=True).is_disabled()
        page.evaluate('releaseSave()')
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        quick = page.evaluate("calls.find(x=>x.type.endsWith('/config/save')).quick_actions[0].value")
        errors = []
        if not confirm_disabled:
            errors.append('Selector confirmation was enabled during save')
        for key, expected in {'entity_id': 'light.extra', 'kind': 'decrease', 'step': 15, 'transition': 0.5, 'loop': True, 'loop_interval': 800}.items():
            if quick.get(key) != expected:
                errors.append(f'Target edit changed {key}: {quick.get(key)!r}')
        assert not errors, errors
        active_summary = page.get_by_role('heading', name='Luce attiva', exact=True).locator('..').locator('p')
        expect(active_summary).to_contain_text('light.desk')
        page.evaluate("""() => {
            const states = {...testHass.states};
            states['light.ceiling'] = {...states['light.ceiling'], state: 'on'};
            states['input_select.lights'] = {...states['input_select.lights'], state: 'light.ceiling'};
            panel.hass = {...testHass, states};
        }""")
        expect(active_summary).to_contain_text('Soffitto light.ceiling', timeout=1500)
        page.evaluate("""() => {
            const states = {...panel.hass.states};
            delete states['input_select.lights'];
            panel.hass = {...panel.hass, states};
        }""")
        expect(active_summary).to_contain_text('Destinatario attivo non disponibile')
        page.evaluate("fixture.warnings = ['zigbee2mqtt_not_discovered']; panel.refresh()")
        expect(page.get_by_text('Nessuna istanza Zigbee2MQTT rilevata.')).to_be_visible()
        page.evaluate("panel.hass = {...panel.hass, language:'en'}")
        expect(page.get_by_text('No Zigbee2MQTT instance detected.')).to_be_visible()
        page.evaluate("window.delaySave=false; mount('/rooms/_no_area/device/none')")
        page.get_by_label('Nome', exact=True).fill('Nuovo pulsante')
        page.get_by_label('Modello / blueprint').select_option('synthetic')
        page.get_by_label('Identificatore eventi', exact=True).fill('z2m/new/action')
        page.get_by_role('button', name='Crea bozza disabilitata', exact=True).click()
        page.get_by_text('Selettore di luci', exact=True).first.click()
        page.get_by_label('Helper luci').select_option('input_select.lights')
        page.get_by_role('button', name='Collega helper esistente', exact=True).click()
        expect(page.get_by_role('button', name='Usa selettore per questo gesto', exact=True)).to_be_visible()
        page.get_by_role('button', name='Crea nuovo elenco', exact=True).click()
        page.get_by_label('Nome elenco luci').fill('Luci della bozza')
        for entity in ('light.desk', 'light.ceiling'):
            page.get_by_label('Luce da aggiungere').select_option(entity)
            page.get_by_role('button', name='Aggiungi luce', exact=True).click()
        page.get_by_role('button', name='Sposta su Soffitto', exact=True).click()
        page.get_by_label('Luce iniziale').select_option('light.desk')
        page.get_by_role('button', name='Crea e collega', exact=True).click()
        expect(page.get_by_text('Salva gesti per registrare il collegamento.')).to_be_visible()
        created = page.evaluate("calls.find(x=>x.type.endsWith('/selector/create'))")
        assert (created['name'], created['options'], created['initial']) == ('Luci della bozza', ['light.ceiling', 'light.desk'], 'light.desk')
        page.get_by_role('button', name='Usa selettore per questo gesto', exact=True).click()
        page.get_by_role('button', name='Conferma gesto selettore', exact=True).click()
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        saved = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).at(-1)")
        assert saved['metadata']['selector_helper'] == 'input_select.draft_lights'
        assert saved['selector_actions'][0]['kind'] == 'next'
        assert saved['selector_actions'][0]['mode'] == 'queued'
        assert saved['config']['enabled'] is False
        page.get_by_role('button', name='Attiva configurazione', exact=True).click()
        expect(page.get_by_role('button', name='Disattiva configurazione', exact=True)).to_be_visible()
        assert page.evaluate("calls.filter(x=>x.type.endsWith('/config/enabled')).length") == 1
        page.evaluate("""() => {
            configs['1'].blueprint.buttons[0].actions[0].release_index = null;
            configs['1'].buttons[0].actions[0].loop = false;
            fixture.controllers.find(controller => controller.device_id === 'knob').blueprint_suggestion = {
                id:'synthetic', name:'Synthetic knob', reason:'gestures'
            };
            return mount('/rooms/studio/device/knob');
        }""")
        expect(page.get_by_role('heading', name='Blueprint suggerito')).to_be_visible()
        expect(page.get_by_text('Candidato basato sui gesti dichiarati da Zigbee2MQTT.', exact=False)).to_have_count(0)
        page.get_by_text('Associazione e attivazione', exact=True).click()
        page.get_by_role('button', name='Cambia blueprint', exact=True).click()
        page.get_by_role('searchbox', name='Cerca blueprint').fill('command')
        page.get_by_label('Modello / blueprint').select_option('synthetic-command')
        preview = page.get_by_role('region', name='Anteprima cambio blueprint')
        expect(preview.get_by_text('Tasto 1 · Doppia pressione', exact=True)).to_be_visible()
        saved_count = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).length")
        page.get_by_role('button', name='Applica cambio alla bozza', exact=True).click()
        expect(page.locator('[data-gesture="0:1"]')).to_have_text('Tasto 1 · Pressione singola')
        assert page.evaluate("configs['1'].blueprint.id") == 'synthetic'
        assert page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).length") == saved_count
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_text('Salvato', exact=True)).to_be_visible()
        changed = page.evaluate("calls.filter(x=>x.type.endsWith('/config/save')).at(-1).config")
        assert changed['id'] == '1' and changed['blueprint'] == 'synthetic-command'
        assert changed['buttons'][0]['actions'][1]['sequence'][0]['action'] == 'light.turn_on'
        expect(page.get_by_role('button', name='Attiva configurazione', exact=True)).to_be_visible()
        page.get_by_text('Associazione e attivazione', exact=True).click()
        page.get_by_role('button', name='Cambia blueprint', exact=True).click()
        page.get_by_label('Modello / blueprint').select_option('acme-mx42')
        page.get_by_role('button', name='Applica cambio alla bozza', exact=True).click()
        expect(page.get_by_label('Identificatore eventi', exact=True)).to_have_value('')
        assert page.evaluate("configs['1'].blueprint.id") == 'synthetic-command'
        page.evaluate("mount('/rooms/studio/device/external')")
        page.get_by_role('button', name='Elimina configurazione', exact=True).click()
        deletion = page.get_by_role('dialog', name='Elimina configurazione')
        expect(deletion).to_contain_text('ID 4')
        deletion.get_by_role('button', name='Annulla', exact=True).click()
        assert not page.evaluate("calls.some(x=>x.type==='switch_manager/config/delete')")
        page.get_by_role('button', name='Elimina configurazione', exact=True).click()
        deletion.get_by_role('button', name='Elimina definitivamente', exact=True).click()
        expect(page.locator('[data-device="external"]')).to_contain_text('0 configurazioni')
        expect(page.get_by_role('button', name='Elimina configurazione', exact=True)).to_have_count(0)
        assert page.evaluate("!configs['4'] && Boolean(configs['1'])")
        assert not page.evaluate("calls.some(x=>x.type==='call_service')")
        print(json.dumps({'product_components': 'passed', 'themes': 2, 'widths': [1440, 390, 320], 'load_actuations': 0}))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
