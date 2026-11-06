# Farhome Switch Manager

Fork pubblico di [macpit/Home-Assistant-Switch-Manager](https://github.com/macpit/Home-Assistant-Switch-Manager), dedicato alla configurazione visuale dei pulsanti e delle manopole in Home Assistant.

## Stato

Repository inizializzato il 6 novembre 2026. Interfaccia Farhome in progettazione: nessuna funzionalità personalizzata implementata e nessuna installazione eseguita su Home Assistant. Base iniziale: `73c7af5e2e23132f6c2e0489d99016babf8741d3` dell'upstream.

## Organizzazione

- `master`: riferimento da mantenere allineato al ramo `master` di macpit.
- `farhome`: requisiti, progettazione e successive personalizzazioni Farhome.
- Licenza GPLv3 e attribuzioni originali conservate.
- Configurazione reale dell'abitazione gestita in Home Assistant; usare dati generici negli esempi pubblici, senza token, credenziali o esportazioni complete dell'istanza.

## Requisiti concordati

1. Una pagina per ogni stanza, con pulsanti e manopole raggruppati e ordinati per modello.
2. Una scheda per dispositivo che mostri le associazioni correnti e consenta la configurazione veloce.
3. Modifica delle funzioni dei gesti: click, doppio click, pressione prolungata e rotazione nelle direzioni supportate dal modello.
4. Azioni con target di diversi tipi: luci, ventilatori, prese e altri dispositivi compatibili. I parametri offerti devono rispettare le capacità del target; per esempio luminosità per una luce e velocità per un ventilatore che la espone.
5. Supporto della logica HOBEIAN già utilizzata: click per selezionare una luce da un elenco configurato, rotella per regolarne la luminosità, doppio click e pressione prolungata con funzioni indipendenti. Non assumere la stessa configurazione per tutte le manopole.
6. Per i selettori, distinguere il target attivo dall'elenco configurato e dal suo ordine.
7. Il ciclo di selezione misto fra tipi di target diversi, come luci e ventilatori nello stesso elenco, resta fuori dal perimetro attuale.
8. Miniatura del modello nell'elenco e nel dettaglio: riutilizzare le immagini disponibili in Zigbee2MQTT o nel blueprint associato, con identificazione verificata, attribuzioni e fallback quando la foto manca.

## Vincoli e prossimi passi

Scelto dall'utente un pannello dedicato dentro Home Assistant. La [proposta di progetto](../superpowers/specs/2026-11-06-farhome-pulsanti-design.md) descrive schermate, gesti, inventario, selettore e salvataggio; resta da approvare prima dell'implementazione. L'anteprima separata usa dati dimostrativi e non è collegata a Home Assistant. Verificare i blueprint dei dispositivi e ricostruire le dipendenze delle associazioni esistenti prima di migrare.

L'integrazione conserva per ora il dominio upstream `switch_manager`: installazione originale e fork non sono due integrazioni indipendenti nella stessa istanza. Il pannello e i comandi WebSocket upstream esaminati richiedono un amministratore; accesso per altri utenti da definire solo se richiesto.

Ogni installazione o modifica all'istanza Home Assistant richiede una decisione separata. Creare il fork non modifica l'impianto domotico.

## Attribution and collaboration

Follow [ATTRIBUTION.md](../../ATTRIBUTION.md) for provenance, license notices, dated modifications, releases and upstream contributions. The default branch is `farhome`; `master` remains the upstream reference. Farhome-specific changes must remain clearly identified as an independent fork.
