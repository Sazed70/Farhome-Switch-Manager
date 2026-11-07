# Farhome Pulsanti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Realizzare nel fork il pannello approvato per configurare pulsanti e manopole per stanza, con miniature, editor gesti multidominio e selettore luci, senza installare o migrare la produzione.

**Architecture:** Estendere il frontend Lit e riusare motore eventi/script ed editor azioni upstream. Un servizio backend amministrativo fornisce inventario, associazioni e salvataggi con controllo di revisione; metadati Farhome in Store separato, sequenze eseguibili nel formato upstream. Aggiornamenti degli helper persistenti separati dal salvataggio dei gesti.

**Tech Stack:** Python/Home Assistant Core 2026.11.0, Lit 3, TypeScript, Rollup; unittest, Node test runner e Python Playwright per verifiche isolate. Core 2026.11.0 richiede Python >=3.14.2: usare ambiente Linux supportato per i test HA, non l'istanza domestica.

**Spec:** [2026-11-06-farhome-pulsanti-design.md](../specs/2026-11-06-farhome-pulsanti-design.md), approvata dopo l'aggiunta delle miniature. Base del piano: `0c179906fb0405757009f51ca607e11a2538df77`.

## Global Constraints

- Accesso amministrativo come upstream; nessuna nuova gestione dei permessi. Dominio switch_manager mantenuto.
- Nessuna installazione, migrazione o modifica della produzione autorizzata da questa proposta.
- Niente invio di messaggi o PR upstream. GPLv3, copyright, storia e attribuzioni conservati.
- Non usare credenziali salvate nel frontend. Non modificare direttamente `.storage`.
- Nessuna semplificazione distruttiva, troncamento a prima azione o trasformazione automatica.
- Cicli misti fra luci e ventilatori esclusi dal perimetro concordato.
- Conservare event listener e motore script upstream; non creare una seconda automazione esecutiva per ogni gesto.
- Usare componenti, temi chiaro/scuro, tipografia e linguaggio visivo HA: non trasferire automaticamente il tema Grafite della Homepage.
- Catalogo pubblico e test con dati sintetici; mai esportazioni, identificativi dell'abitazione o segreti nei commit.
- Nessuna foto di terzi copiata/cache distribuita senza verifica dei diritti. Immagini mancanti non impediscono l'uso.

## Review Focus

1. Identificatori omonimi su più broker/base topic o dispositivi reinseriti: non associare una configurazione al controller sbagliato (Task 1 e 2).
2. Sequenze valide ma non riconosciute, campi aggiuntivi, mode e loop: apertura/salvataggio devono preservarli (Task 3 e 5).
3. Scritture fallite o concorrenti dall'editor originale: non perdere bozze o attivare configurazioni parziali (Task 2 e 5).
4. Helper YAML/condivisi, initial o selezione rimossi: niente falso successo o perdita della configurazione persistente (Task 4 e 6).
5. Immagini fallite, nomi lunghi ed entità unavailable: nomi e funzioni restano raggiungibili su telefono e tastiera (Task 1, 5 e 7).

## File e confini

Nuovi backend in `custom_components/switch_manager/farhome/`: `types.py` (DTO), `store.py` (metadati), `inventory.py` (registri), `zigbee2mqtt.py` (definizioni e miniature), `config_service.py` (salvataggi), `selector.py` (helper), `websocket.py` (trasporto/privilegi). `__init__.py` del sottopacchetto espone il setup, non duplica il motore upstream.

Nuovi frontend in `frontend/src/farhome/`: `types.ts`, `api.ts`, `actions.ts`, `i18n.ts`, `panel.ts`, `device-editor.ts`, `selector-editor.ts`, `thumbnail.ts`. I moduli azioni sono funzioni pure; componenti Lit gestiscono il rendering. Non spostare o riscrivere tutto il frontend originale.

Modifiche limitate all'integrazione: `__init__.py`, `connections.py`, `view.py`, tipi/routing frontend, hook di revisione nell'editor originale. Test in `tests/`, `frontend/test/`; harness isolato in `tests/browser/`. Documentazione operativa del fork in `docs/farhome/`.

## Task 1: inventario verificabile, associazioni e miniature

**Files:** creare i moduli Farhome `types.py`, `store.py`, `inventory.py`, `zigbee2mqtt.py`, `websocket.py`, `__init__.py`; modificare `custom_components/switch_manager/__init__.py`; creare `tests/test_farhome_inventory.py`, `tests/test_farhome_images.py`, `tests/test_farhome_store.py`, `tests/__init__.py`, `tests/fixtures.py`, `requirements-test.txt` e `.github/workflows/farhome-tests.yaml`.

**Interfaces:** `async_snapshot(hass) -> dict` restituisce `{areas, controllers, unassociated_configs, revision, warnings}`. Ogni controller ha device_id, area_id, manufacturer, model, config_ids, management, compatibility, image e riferimenti esterni. `FarhomeStore` carica/salva `version=1`, `controllers` indicizzati per device_id e `bindings` per config_id; `async_update(expected_revision, patch) -> revision` non modifica i dati in memoria se la scrittura fallisce. Endpoint `switch_manager/farhome/snapshot` e `switch_manager/farhome/metadata/save` amministrativi.

- [ ] Scrivere test `test_inventory_keeps_empty_areas_and_unassociated_configs`, `test_manual_device_without_blueprint_is_not_executable`, `test_controller_deduplicates_multiple_configs`, `test_ambiguous_mqtt_identifier_is_not_bound`, `test_readded_device_leaves_stale_binding_visible`, `test_metadata_save_failure_preserves_previous_data`, `test_images_require_exact_definition_and_fall_back`.
- [ ] Eseguirli con `python -m unittest discover -s tests -p 'test_farhome_*.py' -v`: attendersi fallimento per moduli Farhome mancanti prima dell'implementazione.
- [ ] Implementare i DTO e Store con lock e revisione deterministica; usare API registri HA e le configurazioni gestite. Includere tutti i dispositivi aggiunti manualmente, quelli collegati alle configurazioni e quelli riconosciuti da definizioni con azioni; la lista non deve fingere riconoscimento universale. Associazioni automatiche solo tramite riferimenti univoci; nessuna ricerca fuzzy sui nomi.
- [ ] Riutilizzare `async_discover_zigbee2mqtt_instances` per scoprire i base topic; leggere con timeout solo i retained `<base>/bridge/devices`, senza pubblicare comandi. Disiscrivere sempre, limitare dimensioni/payload, separare base topic e IEEE. Corrispondenza HA tramite identificatori del registro, mai sola friendly_name. Timeout/MQTT assente produce avviso e conserva inventario HA e associazioni manuali.
- [ ] Produrre immagine `{url, source_url, source_label}` solo da modello verificato o blueprint associato; rispettare eventuale icon personalizzata solo se accessibile senza credenziali/nuove rotte. Icona locale ingress non risolvibile resta avviso/fallback. Nessun proxy HTTP arbitrario; non fidarsi di schema javascript/data o path traversali. Separare modello tecnico e descrizione HA.
- [ ] Aggiungere i test HA reali con fixture HomeAssistant e MQTT simulato; usare Python 3.14.2 e `homeassistant==2026.11.0` su Linux in CI. Nessun broker reale o token. Rieseguire la suite e verificare PASS; eseguire `python -m compileall custom_components/switch_manager`.
- [ ] Commit: `feat: add Farhome controller inventory and model images`.

## Task 2: salvataggio configurazioni e concorrenza

**Files:** creare `farhome/config_service.py`, `tests/test_farhome_config.py`; modificare `farhome/websocket.py`, `connections.py`, `store.py` solo nei punti di scrittura/configurazione esistenti.

**Interfaces:** `async_read_config(hass, config_id) -> {config, metadata, revision}`; `async_save_config(hass, config, metadata, expected_revision) -> {config_id, config, metadata, revision}`; `async_set_enabled(hass, config_id, enabled, expected_revision, conflict_check) -> revision`. Endpoint `switch_manager/farhome/config/get`, `/save`, `/enabled`; errori stabili `conflict`, `validation_error`, `persistence_failed`, `partial_write`, `activation_blocked`.

- [ ] Scrivere `test_stale_revision_rejected_after_legacy_save`, `test_two_new_configs_get_distinct_ids`, `test_save_error_does_not_replace_runtime`, `test_partial_metadata_failure_never_enables_new_config`, `test_legacy_delete_cleans_binding`, `test_duplicate_does_not_copy_physical_binding`, `test_external_active_reference_blocks_activation`, `test_non_admin_denied`.
- [ ] Eseguire `python -m unittest tests.test_farhome_config -v`: inizialmente FAIL per servizio assente.
- [ ] Coordinare validazione e scritture con un lock condiviso anche dagli endpoint upstream save/enabled/delete/duplicate. Usare revisione dei dati effettivi, non contatore solo Farhome; aggiornare entrambi gli editor per inviarla. Allocazione ID dentro lock globale, senza int/string conversioni incoerenti. Validare blueprint, indici/numero di gesti e sequenze tramite HA prima di mutare runtime/storage. Conservare mode, loop, intervalli e campi supportati.
- [ ] Nuova configurazione nasce disabilitata; preparare salvataggio persistente prima di sostituire listener/runtime, riportare ogni errore con bozza intatta. Store upstream e metadati non formano una transazione: esplicitare write parziale, mantenere nuova configurazione disabilitata e non avviare un rollback che sovrascriva cambi concorrenti.
- [ ] Verificare riferimenti di gestione esterna dichiarati e stato effettivo delle automazioni note prima dell'attivazione; richiedere presa visione dei gestori concorrenti non rilevabili. Non disabilitare automazioni esterne. Eliminare metadati di una configurazione cancellata mantenendo eventuale registrazione manuale del controller.
- [ ] Rieseguire test nuovi e Task 1: PASS; aggiungere test di aggiornamento attraverso l'editor originale, non solo chiamate interne al servizio.
- [ ] Commit: `feat: coordinate Farhome configuration saves and revisions`.

## Task 3: azioni rapide senza perdita di sequenze avanzate

**Files:** creare `frontend/src/farhome/types.ts`, `actions.ts`, `api.ts`, `i18n.ts`, `frontend/test/actions.test.mjs`, `frontend/tsconfig.test.json`; modificare `frontend/package.json`, `frontend/src/types.ts`; creare `tests/test_farhome_actions.py` e validazione backend corrispondente.

**Interfaces:** `parseQuickAction(action: SwitchConfigButtonAction): QuickAction | null`; `buildQuickAction(value: QuickAction): SwitchConfigButtonAction`; `supportedQuickActions(entity, services): ActionOption[]`. QuickAction conserva `mode`, `loop`, `loop_interval` oltre a dominio, entità, azione, percentuale/transizione pertinenti. `FarhomeApi` espone snapshot/get/save/setEnabled con i DTO Task 1/2.

- [ ] Scrivere test Node: sequenza con delay/choose/campi ignoti restituisce null e resta immutata; round trip di azioni note conserva 10%, transizione 0.1 e mode; fan non offre brightness; entità senza capacità di velocità non offre step; entità unavailable mantiene il riferimento configurato; scena/script producono azioni corrette; JSON input malevolo non viene interpolato in HTML.
- [ ] Aggiungere `npm test` che compila solo i moduli puri in `.test-build` e usa `node --test test/*.test.mjs`; eseguire prima del modulo e verificare FAIL. Ignorare `.test-build` nel `.gitignore`.
- [ ] Implementare parser conservativo: accetta solo sequenze completamente comprese; action/service alias gestiti senza eliminare dati. Qualsiasi campo non supportato passa all'avanzato. L'editor rapido usa una singola entità per validare capacità; aree/dispositivi/sequenze restano disponibili nell'editor HA. Traduzioni nuove in italiano con fallback inglese; nessuna libreria UI aggiunta.
- [ ] Implementare API tipizzata e validazione backend delle azioni rapide. Capacità lette da servizi/schema e supported_features delle entità HA; nessun dominio dedotto dai nomi dei gesti. Nuovi payload rapidi distinti dalle sequenze arbitrarie, per consentire validazione backend coerente.
- [ ] Verificare `npm test`, `npx tsc --noEmit`, test Python: PASS.
- [ ] Commit: `feat: add lossless quick gesture actions`.

## Task 4: selettore luci persistente

**Files:** creare `farhome/selector.py`, `tests/test_farhome_selector.py`; modificare `farhome/websocket.py`, `frontend/src/farhome/types.ts`, `api.ts`, `actions.ts`, `frontend/test/actions.test.mjs`.

**Interfaces:** `async_read_selector(hass, entity_id) -> {entity_id, options, active, initial, editable, revision, known_references}`; `async_update_selector(hass, entity_id, options, active, initial, expected_revision, dependencies_acknowledged) -> snapshot`. Endpoint `switch_manager/farhome/selector/get` e `/update`. `buildSelectorAction(helper_id, kind, step, transition)` genera sequenze HA standard per `next`, `brightness_up`, `brightness_down`.

- [ ] Scrivere test `test_yaml_options_are_read_only`, `test_ui_options_survive_store_reload`, `test_invalid_empty_duplicate_mixed_or_missing_entities_rejected`, `test_unavailable_light_preserved`, `test_removed_active_or_initial_requires_valid_replacement`, `test_shared_helper_requires_acknowledgment`, `test_external_conflict_detected_without_blind_rollback`, `test_partial_active_update_reported`. Per il generatore: helper valutato all'evento, passo +/-10%, transizione0.1, doppio/hold immutati.
- [ ] Eseguire `python -m unittest tests.test_farhome_selector -v` e `npm test`: nuove aspettative inizialmente FAIL.
- [ ] Leggere configurazione persistente dalla collezione ufficiale input_select ed effettuare aggiornamento tramite le API della collezione dietro endpoint amministrativo; non scrivere `.storage` e non usare set_options come persistenza. Conservare tutti i campi non editati. Identificare helper UI tramite ID della collezione, senza indovinare dallo slug entity_id; YAML o origine non risolta in sola lettura.
- [ ] Lock per helper, revisione prima/dopo, aggiornamento dello stato selezionato solo quando esplicitamente richiesto. Riferimenti mancanti bloccano modifica, unavailable no. Rileggere configurazione/stato prima di successo; esiti parziali chiari, nessun retry cieco.
- [ ] Generare selettore con controlli di validità dell'opzione attuale e sequenze standard HA, usando il motore script upstream. Il feedback a due toggle resta sequenza avanzata separata, non viene aggiunto automaticamente. Vietare modifica elenco se controller esterno o configurazione non ancora migrata.
- [ ] Rieseguire suite Task 1–4: PASS; simulare ricaricamento Store, non soltanto ispezionare lo stato in memoria.
- [ ] Commit: `feat: add persistent light selector configuration`.

## Task 5: pannello stanze ed editor gesti

**Files:** creare `frontend/src/farhome/panel.ts`, `device-editor.ts`, `thumbnail.ts`, `tests/browser/harness.html`, `tests/browser/farhome_panel.py`; modificare `switch-manager-panel.ts`, `switch-manager-switch-editor.ts`, `view.py`, `frontend/README.md`.

**Interfaces:** pannello Lit riceve hass/narrow/route; rotte `/switch_manager/rooms/{area_id}` e `/switch_manager/rooms/{area_id}/device/{device_id}`. Sentinelle dedicate per senza stanza e da associare. L'editor riceve controller e `{config, metadata, revision}`; notifica `dirty-changed`, `save`, `cancel` senza eseguire servizi dei carichi. `/legacy` e rotte originali `/new`/`/edit` restano accessibili; voce laterale «Pulsanti».

- [ ] Creare harness con hass.callWS e servizi simulati, caricando gli stessi componenti prodotto dal bundle di test; le fixture imitano soltanto dati/risposte HA. Non usare l'HTML dell'anteprima come prodotto o mock del codice sotto test. Python Playwright testa room empty/unassigned, associazione manuale, più config per controller, gesti multipulsante, sequenza avanzata intatta, fan senza velocità, nomi lunghi, errore di lettura/save, conflitto e salvataggio doppio.
- [ ] Eseguire la suite prima dei nuovi componenti: FAIL per pannello/rotte assenti.
- [ ] Implementare navigazione per area e dettaglio affiancato desktop/pagina mobile, gruppi produttore-modello-nome con localeCompare. Stato iniziale distinto da errore e vuoto. Scelta device/blueprint/identificatore esplicita per dispositivi non associati; stato compatibilità separato dalla gestione. Configurazioni multiple richiedono scelta esplicita, non primo risultato automatico.
- [ ] Implementare thumbnail contain56/80px con alt decorativo accanto ai nomi, credito per origine, riserva su error. Usare colori/typography HA. L'editor mostra soltanto tasti/gesti del blueprint, usa parser rapido Task3 o editor HA esistente, con conferma esplicita prima di sostituire una sequenza avanzata. Non mettere nell'editor funzioni tecniche non utili all'utente.
- [ ] Implementare bozza per dispositivo, cambio gesto senza perdita, navigazione con salva/scarta/resta, salva disabilitato in corso, errori con bozza conservata. Entrambi gli editor inviano revisioni Task2; mantenerne la risposta aggiornata dopo ogni modifica. Esterni in sola consultazione, preparazione crea bozza disabilitata. Nessun pulsante di esecuzione dei carichi nel nuovo pannello.
- [ ] Verificare con `python tests/browser/farhome_panel.py` e build/typecheck; usare Chrome Beta sul PC Windows se disponibile, Chromium in CI. Tutti i test nuovi devono passare; screenshot desktop1440 e mobile390/320 con tema chiaro e scuro.
- [ ] Commit: `feat: add Farhome rooms and gesture editor`.

## Task 6: editor del selettore nel pannello

**Files:** creare `frontend/src/farhome/selector-editor.ts`; modificare `device-editor.ts`, `i18n.ts`, `tests/browser/farhome_panel.py`.

**Interfaces:** componente riceve snapshot Task4; emette richiesta update con revisione, ordine entity_id e sostituzioni esplicite initial/active; gestisce una bozza distinta dai gesti. Cambio fra destinatario fisso e selettore modifica solo gesti esplicitamente scelti e mostra prima il riepilogo.

- [ ] Aggiungere casi browser per collegamento helper, ordine/add/remove, rifiuto lista vuota/duplicata/mista, YAML sola lettura, active non disponibile, conflitto, esito parziale e due modifiche indipendenti elenco/gesti. Asserire che doppio e hold e sequenze feedback restano identici.
- [ ] Eseguire: nuovi casi inizialmente FAIL.
- [ ] Implementare elenco ordinato e target attivo distinti, riordino accessibile su/giù, modifica persistente con «Applica elenco», salva dispositivo separato. Riepilogo dipendenze note e messaggi per origine YAML, helper condiviso o rimosso. Nessun valore active simulato nel prodotto.
- [ ] Verificare suite frontend/browser/backend completa: PASS.
- [ ] Commit: `feat: expose light selection and ordered targets in the panel`.

## Task 7: verifica completa e documentazione del risultato

**Files:** bundle `custom_components/switch_manager/assets/switch_manager_panel.js`; README, `docs/farhome/README.md`, nuova `docs/farhome/testing-and-migration.md`, piano corrente; aggiornare ATTRIBUTION solo se nuove fonti/risorse lo richiedono.

- [ ] Eseguire da checkout isolato pulito: `python -m unittest discover -s tests -v`, `npm ci`, `npm test`, `npx tsc --noEmit`, `npm run build`, suite browser1440/390/320 e chiaro/scuro. Far eseguire i test HA in CI/Linux Python>=3.14.2 quando non disponibile localmente; registrare controlli non eseguiti senza chiamarli passati. Il test browser non usa HA domestico.
- [ ] Controllare che browser non emetta servizi light/fan/switch durante editing, che thumbnail indisponibili non nascondano controller e che tastiera possa scegliere gesti, riordinare e annullare. Rivedere screenshot alle dimensioni previste e retestare soltanto le correzioni applicate.
- [ ] Revisore indipendente sul diff completo e sulle prove; correggere problemi materiali, verificare regressioni e rileggere stato remoto prima di pubblicare. Verificare LICENSE/attribuzioni, dati sintetici e assenza segreti, lockfile/bundle coerenti, nessun cambiamento estraneo.
- [ ] Documentare capacità effettivamente implementate e copertura dei modelli, limiti delle dipendenze indirette e delle immagini personalizzate, istruzioni ambiente test. Separare chiaramente pronto in test da compatibilità hardware validata. Piano migrazione reale futuro: un controller, backup, copia config, verifica eventi, passaggio manuale e ritorno; non eseguirlo.
- [ ] Pubblicare sul fork un ramo di sviluppo con i commit verificati; mantenere `master` upstream. Aggiornare stato documentale e registro Homelab locale senza sincronizzare quel repository. Nessuna release applicativa o installazione implicita.
- [ ] Commit: `docs: document Farhome validation and staged migration`.

## Controllo del piano

Copertura: inventario/stanze/associazioni/miniature Task1+5; metadati e concorrenza Task1+2; gesti multidominio e avanzato Task3+5; helper/selettore persistente Task4+6; accessibilità, build e attribuzioni Task5+7. I cinque rischi di Review Focus hanno ciascuno test nominati nei relativi task. La struttura non richiede nuovi framework UI, sostituzione del motore eventi o accesso all'istanza reale.

## Stato di esecuzione — 7 novembre 2026

Il lavoro è stato eseguito direttamente in chat su un checkout isolato del ramo `work/farhome-panel`. La revisione indipendente e le regressioni finali coprono conservazione dei parametri, protezione della bozza durante il salvataggio e aggiornamento della luce attiva. Il collaudo fisico e la migrazione restano attività future. Le prove e i limiti sono descritti nella [guida di verifica](../../farhome/testing-and-migration.md).
