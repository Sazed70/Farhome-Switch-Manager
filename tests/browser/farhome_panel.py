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
        page.get_by_role('button', name='Studio', exact=True).click()
        page.locator('[data-device="many"]').click()
        expect(page.get_by_label('Configurazione')).to_be_visible()
        expect(page.locator('farhome-device-editor [data-gesture]')).to_have_count(0)
        page.locator('[data-device="knob"]').click()
        expect(page.locator('[data-gesture]')).to_have_count(5)
        expect(page.get_by_label('Modalità', exact=True)).to_have_value('restart')
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
        page.get_by_label('Funzione', exact=True).select_option('increase')
        page.get_by_label('Passo velocità (%)').fill('15')
        page.evaluate('window.failSave=true')
        page.get_by_role('button', name='Salva gesti', exact=True).click()
        expect(page.get_by_role('alert')).to_contain_text('Ricarica')
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
        for theme in ('light', 'dark'):
            page.evaluate("theme=>document.body.classList.toggle('dark',theme==='dark')", theme)
            for width in (1440, 390, 320):
                page.set_viewport_size({'width': width, 'height': 1000})
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), (theme, width)
                output = root / '.superpowers/sdd/2026-11-06-farhome-pulsanti'
                page.screenshot(path=str(output / f'product-{theme}-{width}.png'), full_page=True)
        page.evaluate('window.failRead=true;mount()')
        expect(page.get_by_role('alert')).to_contain_text('Lettura non riuscita')
        page.evaluate('window.failRead=false')
        page.get_by_role('button', name='Riprova', exact=True).click()
        expect(page.locator('[data-device="knob"]')).to_be_visible()
        assert not page.evaluate("calls.some(x=>x.type==='call_service')")
        print(json.dumps({'product_components': 'passed', 'themes': 2, 'widths': [1440, 390, 320], 'load_actuations': 0}))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
