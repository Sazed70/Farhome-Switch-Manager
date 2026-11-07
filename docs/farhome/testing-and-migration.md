# Pannello Pulsanti: verifica e migrazione futura

Implementazione sul ramo `work/farhome-panel`, con una prova su un singolo controller.
Nessuna release applicativa.

## Comportamento implementato

- Stanze dal registro HA, incluse stanze vuote, Senza stanza e Da associare.
- Controller individuati da configurazioni esistenti, definizioni Zigbee2MQTT con
  azioni, o aggiunta manuale dal registro; nessuna deduzione dalla sola batteria.
  Le associazioni MQTT ambigue richiedono conferma. Un dispositivo reinserito non
  viene automaticamente associato a una vecchia configurazione fisica.
- Raggruppamento per produttore/modello, ordinamento locale dei nomi, una voce per
  controller e scelta esplicita fra più configurazioni.
- Miniature del modello esatto dichiarato in Zigbee2MQTT o del blueprint associato,
  credito per origine e icona di riserva. Nessuna compatibilità dedotta dalla foto.
  Le immagini richiedono che il browser possa raggiungere il catalogo; percorsi
  locali `device_icons` non vengono esposti o copiati automaticamente.
- Gesti definiti dal blueprint, con moduli rapidi per entità light/fan/switch/scene/
  script. Capacità e servizi sono validati anche sul backend. Un ventilatore offre
  velocità solo se la supporta; un’entità unavailable conserva il suo identificatore.
- Sequenze non completamente riconosciute restano avanzate e passano all’editor
  HA corrente. La sostituzione rapida è esplicita e riguarda un solo gesto.
  L’editor nuovo non invia azioni a luci, ventilatori o prese durante la configurazione.
- Salvataggi revisionati condivisi con l’editor originale, bozze conservate sugli
  errori, controllo delle modifiche non salvate e configurazioni nuove disabilitate.
  Dopo il salvataggio, **Attiva configurazione** verifica che blueprint e topic
  coincidano con quelli rilevati da Zigbee2MQTT. Per un’associazione incerta o una
  gestione esterna serve una conferma manuale. Un conflitto rilevato blocca anche
  l’attivazione confermata. Il controllo confronta le configurazioni Farhome attive,
  le automazioni esterne dichiarate e i trigger Home Assistant con topic MQTT
  letterale o riferimento diretto al dispositivo. Template e gestori esterni non
  dichiarati possono richiedere una verifica a parte. Farhome non disattiva automazioni.
- Selettore di sole luci con helper input_select esistente. Click e rotazioni
  vengono assegnati singolarmente: gli altri gesti e il feedback avanzato restano
  intatti. La luce viene letta all’evento e validata prima dell’azione dinamica.
- Elenco ordinato, luce attiva e iniziale distinti. «Applica elenco» è separato da
  «Salva gesti». Helper UI aggiornati tramite le API native persistenti; helper YAML
  leggibili e utilizzabili, elenco in sola lettura. Per collegare un helper serve
  una configurazione attiva già verificata; il cambio sorgente la disabilita fino
  alla successiva attivazione esplicita.

Non è stato aggiunto un catalogo di hardware Farhome collaudato. I blueprint
ereditati rimangono disponibili; gli esempi sintetici HOBEIAN non dimostrano il
modello effettivo o gli eventi del dispositivo domestico.

## Ambiente e comandi di test

Backend verificato su Linux/WSL Debian con Python 3.14.2, Home Assistant 2026.11.0,
frontend HA 20261028.4 e paho-mqtt 2.1.0. Windows Python 3.13 non soddisfa i requisiti
di questa versione HA: usare Linux e un ambiente Python compatibile.

```sh
python3.14 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements-test.txt
python -m unittest discover -s tests -v
python -m compileall -q custom_components/switch_manager
```

Frontend verificato localmente con Node 26.13.0; CI usa Node 24. Nessun nuovo
framework UI. Installazione riproducibile dal lockfile:

```sh
cd frontend
npm ci
npm test
npx tsc --noEmit
npm run build
cd ..
python -m pip install -r requirements-browser-test.txt
python -m playwright install chromium
python tests/browser/legacy_revision.py
python tests/browser/farhome_panel.py
```

I test browser usano Chrome Beta su Windows quando disponibile; altrimenti
Playwright Chromium o l’eseguibile `FARHOME_BROWSER`. Importano il bundle reale e
simulano solo dati/trasporto HA. Il server è temporaneo e limitato a loopback.
Screenshot temporanei a 1440/390/320 px, temi chiaro/scuro. La CI esegue entrambe
le suite, compreso ricaricamento del vero Store HA e del helper input_select.
Il job Python usa Ubuntu 24.04, per cui GitHub Actions distribuisce Python 3.14.2,
e basa la cache su `requirements-test.txt`.

Prove locali: 64 test Python, 11 test Node, controllo
TypeScript, build e due suite browser. Le regressioni aggiunte verificano che il
cambio di destinatario conservi i parametri del gesto, che la conferma del
selettore sia disabilitata durante un salvataggio e si chiuda al cambio di gesto,
e che il riepilogo segua lo stato corrente dell’helper. I test coprono anche scritture fallite,
conflitti tra editor, metadati, indici, capacità, persistenza nativa, helper YAML,
dipendenze note, stato parziale, nomi lunghi/HTML e navigazione mobile. Il motore
Script HA viene provato con servizi simulati: nessun carico reale è comandato.

Il controllo npm ha portato picomatch alla versione corretta e aggiornato il plugin
Terser a 1.0.2. Restano due segnalazioni low, la dipendenza di build deepmerge 4.3.1
e il suo chiamante node-resolve: [advisory GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).
L’advisory non riporta una versione corretta; il downgrade forzato del resolver
proposto da npm non viene applicato. Non sono librerie incluse nel pannello runtime.

## Limiti di consistenza e compatibilità

Gli editor Farhome e originale condividono un blocco e revisioni della configurazione.
Metadati e configurazione sono due Store: in caso di errore si compensa solo la
propria revisione dei metadati; un errore di compensazione è esplicito e non attiva
una nuova configurazione. Non è una transazione fra file resistente a ogni crash.

La collezione input_select usa il normale salvataggio differito HA. Il test verifica
persistenza dopo chiusura/ricaricamento, senza scrivere direttamente `.storage`.
Le sue API non offrono compare-and-swap verso editor esterni: Farhome controlla
revisioni prima e dopo, segnala un conflitto osservabile e non ripristina alla cieca
uno stato che potrebbe contenere modifiche altrui. Helper e gesti hanno bozze separate.
Un errore parziale richiede rilettura prima di riprovare.

I riferimenti alle automazioni sono quelli dichiarati, non una ricerca infallibile
di tutte le dipendenze indirette. Non è garantita l’esclusività dell’helper o del
controller. Le API della collezione e i componenti frontend HA devono essere
ricontrollati dopo aggiornamenti HA. Gli endpoint sono amministrativi.

## Procedura per una prova su un nuovo controller

1. Scegliere un solo controller e raccogliere modello, blueprint ed eventi reali.
2. Fare backup HA e copia recuperabile della configurazione/automazioni/helper.
3. Annotare lista, ordine, active/initial, passi, transizioni, mode, ritardi e feedback
   a due toggle di 500 ms; conservare separatamente doppio click e pressione prolungata.
4. Preparare la configurazione Farhome disabilitata e confrontare tutti i gesti.
5. Verificare e disattivare manualmente il vecchio gestore, poi attivare uno solo
   dei due. Non lasciare due gestori degli stessi eventi in parallelo.
6. Provare click/rotazioni/doppio/hold sul solo dispositivo autorizzato, includendo
   unavailable e riavvio/ricaricamento; verificare la persistenza della lista.
7. Se il comportamento diverge, disabilitare Farhome prima di ripristinare il vecchio
   gestore e i dati salvati. Annotare esito e stato effettivo.

Una prova pilota ha verificato click singolo e doppio click. Il dominio resta
`switch_manager`, condiviso con l’integrazione originale.

La verifica HACS ereditata controlla anche i requisiti per la pubblicazione nel
catalogo. Sul fork segnala che mancano i topic richiesti e che le issue sono
disabilitate. Queste condizioni riguardano la pubblicazione nel catalogo.
