"""Run real bundled legacy components against an in-memory HA transport boundary."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import json
import os
from threading import Thread
from playwright.sync_api import sync_playwright


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
        page = browser.new_page()
        page.goto(f'http://127.0.0.1:{server.server_port}/tests/browser/legacy-harness.html')
        page.evaluate('''async () => {
          await customElements.whenDefined('switch-manager-switch-editor');
          await customElements.whenDefined('switch-manager-index');
          window.calls = [];
          window.testRevision = 1;
          const config = {id:'0',name:'Synthetic',enabled:false,identifier:'demo/action',rotate:0,variables:{},valid_blueprint:true,is_mismatch:false,
            blueprint:{id:'synthetic',name:'Synthetic',service:'Zigbee2MQTT',has_image:false,buttons:[{actions:[{title:'single'}]}]},
            buttons:[{actions:[{sequence:[],mode:'restart',loop:false,loop_interval:250}]}]};
          window.testHass = {connection:{subscribeMessage:async()=>()=>{},subscribeEvents:async()=>()=>{}},callWS:async(msg)=>{
            window.calls.push(structuredClone(msg));
            if(msg.type==='switch_manager/config/save'||msg.type==='switch_manager/config/enabled')window.testRevision++;
            return {configs:{'0':structuredClone(config)},config:structuredClone(config),config_id:msg.type==='switch_manager/config/duplicate'?'1':'0',enabled:false,
              revision:'revision-'+window.testRevision,revisions:{'0':'revision-'+window.testRevision}};
          }};
          window.editor = document.createElement('switch-manager-switch-editor');
          editor.hass=testHass;editor.params={id:'0'};editor._loadConfig();
        }''')
        page.wait_for_function('window.editor.config !== undefined')
        for count in (1, 2):
            page.evaluate('editor._save()')
            page.wait_for_function(f"calls.filter(x=>x.type==='switch_manager/config/save').length==={count} && !editor._block_save")
        saves = page.evaluate("calls.filter(x=>x.type==='switch_manager/config/save')")
        assert [msg.get('expected_revision') for msg in saves] == ['revision-1', 'revision-2'], saves
        page.evaluate("window.index = document.createElement('switch-manager-index');index.hass=testHass;index._populateSwitches()")
        page.wait_for_function('index._data.length===1')
        page.evaluate("index._toggleEnabled('0',true)")
        page.wait_for_function("calls.some(x=>x.type==='switch_manager/config/enabled') && index._revisions['0']==='revision-4'")
        page.evaluate("index._duplicate('0')")
        page.wait_for_function("calls.some(x=>x.type==='switch_manager/config/duplicate')")
        page.evaluate("index._delete('0')")
        page.wait_for_function("calls.some(x=>x.type==='switch_manager/config/delete')")
        mutations = page.evaluate("calls.filter(x=>/config\\/(enabled|duplicate|delete)$/.test(x.type))")
        assert [msg.get('expected_revision') for msg in mutations] == ['revision-3', 'revision-4', 'revision-4'], mutations
        page.evaluate('''() => {
          editor._loadConfig();
          const original = testHass.callWS;
          testHass.callWS = msg => msg.type === 'switch_manager/config/save'
            ? new Promise(resolve => { window.releaseSave = () => original(msg).then(resolve); }) : original(msg);
        }''')
        page.wait_for_function("editor._revision === 'revision-4'")
        page.evaluate('editor._save()')
        page.wait_for_function('typeof window.releaseSave === "function"')
        page.evaluate("editor.config.name='Edited while saving';editor._dirty=true;releaseSave()")
        page.wait_for_function('!editor._block_save')
        assert page.evaluate('editor.config.name') == 'Edited while saving'
        assert page.evaluate('editor._dirty') is True
        print(json.dumps({'legacy_save_revisions': [msg['expected_revision'] for msg in saves], 'legacy_mutation_revisions': [msg['expected_revision'] for msg in mutations]}))
        browser.close()
finally:
    server.shutdown()
    server.server_close()
