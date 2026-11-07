# Farhome Switch Manager

Fork pubblico di [macpit/Home-Assistant-Switch-Manager](https://github.com/macpit/Home-Assistant-Switch-Manager), dedicato alla configurazione visuale dei pulsanti e delle manopole in Home Assistant.

## Stato

Il pannello sul ramo `work/farhome-panel` include inventario, stanze, miniature, ricerca blueprint, gesti multidominio e selettore persistente. L’interfaccia segue la lingua del profilo Home Assistant per italiano e inglese. Il ramo di sviluppo è stato provato su un singolo controller. La base upstream è `73c7af5e2e23132f6c2e0489d99016babf8741d3`. [Prove e limiti](testing-and-migration.md).

## Organizzazione

- `master`: riferimento da mantenere allineato al ramo `master` di macpit.
- `farhome`: requisiti, progettazione e successive personalizzazioni Farhome.
- Licenza GPLv3 e attribuzioni originali conservate.
- Configurazione reale dell'abitazione gestita in Home Assistant; usare dati generici negli esempi pubblici, senza token, credenziali o esportazioni complete dell'istanza.

## Requisiti concordati

1. Una pagina per ogni stanza, con pulsanti e manopole raggruppati e ordinati per modello.
2. Una scheda per dispositivo che mostri le associazioni correnti e consenta la configurazione veloce.
3. Modifica delle funzioni dei gesti: click, doppio click, pressione prolungata e rotazione nelle direzioni supportate dal modello.
4. Azioni con target di diversi tipi: luci, ventilatori, prese e altri dispositivi compatibili. I parametri offerti devono rispettare le capacità del target; per esempio luminosità per una luce e velocità per un ventilatore che la espone. Possibilità di agire su tutte le luci o dispositivi di una stanza con un singolo gesto tramite target d'area (`area_id`).
5. Supporto della logica HOBEIAN già utilizzata: click per selezionare una luce da un elenco configurato con feedback visivo a doppio toggle (500 ms) per identificare la luce attiva (accensione temporanea se spenta, micro-lampeggio se accesa), rotella per regolarne la luminosità, doppio click e pressione prolungata con funzioni indipendenti. Non assumere la stessa configurazione per tutte le manopole.
6. Per i selettori, distinguere il target attivo dall'elenco configurato e dal suo ordine.
7. Il ciclo di selezione misto fra tipi di target diversi, come luci e ventilatori nello stesso elenco, resta fuori dal perimetro attuale.
8. Miniatura del modello nell'elenco e nel dettaglio: riutilizzare le immagini disponibili in Zigbee2MQTT o nel blueprint associato, con identificazione verificata, attribuzioni e fallback quando la foto manca.

## Vincoli e prossimi passi

Scelto dall'utente un pannello dedicato dentro Home Assistant. La [proposta di progetto](../superpowers/specs/2026-11-06-farhome-pulsanti-design.md) è stata approvata; il [piano](../superpowers/plans/2026-11-06-farhome-pulsanti.md) è stato eseguito nel checkout isolato. Il collaudo automatico carica gli stessi componenti del prodotto, con risposte HA simulate. Prima di qualsiasi migrazione reale restano da verificare blueprint, eventi e dipendenze di un singolo controller autorizzato.

L'integrazione conserva per ora il dominio upstream `switch_manager`: installazione originale e fork non sono due integrazioni indipendenti nella stessa istanza. Il pannello e i comandi WebSocket upstream esaminati richiedono un amministratore; accesso per altri utenti da definire solo se richiesto.

Ogni installazione o modifica all'istanza Home Assistant richiede una decisione separata. Creare il fork non modifica l'impianto domotico.

## Attribution and collaboration

Follow [ATTRIBUTION.md](../../ATTRIBUTION.md) for provenance, license notices, dated modifications, releases and upstream contributions. The default branch is `farhome`; `master` remains the upstream reference. Farhome-specific changes must remain clearly identified as an independent fork.
