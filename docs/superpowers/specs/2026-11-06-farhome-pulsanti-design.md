# Farhome: pannello Pulsanti per Home Assistant

Data: 6 novembre 2026. Stato: proposta da approvare, non implementata.
Repository di destinazione: Sazed70/Farhome-Switch-Manager, ramo farhome.
Base esaminata: 8646d78f7485dbe6728634d0ef59b3edb597d750.

## Intento e requisiti confermati

Configurare rapidamente pulsanti e manopole fisici senza inseguire automazioni e helper separati. L'utente ha scelto un pannello dedicato dentro Home Assistant. Una pagina per ogni stanza, dispositivi raggruppati e ordinati per produttore/modello e poi nome. Funzioni dei gesti modificabili, inclusi click singolo, doppio, prolungato e rotazioni quando supportati dal dispositivo. Destinatari non limitati alle luci: ventilatori, prese e altre entità/azioni disponibili in HA. Parametri coerenti con capacità reali e azione scelta.

Supportare la configurazione HOBEIAN che usa click per selezionare una luce e rotazione per regolare la luce selezionata, mantenendo indipendenti doppio click e hold. Distinguere elenco ordinato e destinatario attivo. Non attribuire questo comportamento a tutte le manopole. Cicli misti fra luci e ventilatori esclusi dal perimetro concordato.

## Approcci considerati e scelta

1. Pannello dedicato nell'integrazione fork: riusa Lit/TypeScript, editor azioni e backend Switch Manager; consente un flusso completo stanza-dispositivo-gesto. Richiede inventario, associazioni e persistenza aggiuntivi. Scelto dall'utente il 6 novembre 2026.
2. Dashboard Lovelace con schede personalizzate: composizione libera, ma richiede comunque editor e API per le funzioni richieste. Non scelta.

## Perimetro e vincoli

Questo documento propone l'intero comportamento del pannello. L'anteprima allegata verifica la navigazione e i moduli con dati sintetici: non è codice prodotto, non si collega a HA e non dimostra compatibilità dei dispositivi. Il primo incremento implementativo deve fornire inventario, associazioni esplicite ed editor per configurazioni Farhome; prima della migrazione reale serve una prova autorizzata su un dispositivo.

Accesso amministrativo come upstream; nessuna nuova gestione dei permessi. Dominio switch_manager mantenuto. Il fork e l'originale non diventano installazioni indipendenti nella stessa istanza. Nessuna installazione, migrazione o modifica della produzione autorizzata da questa proposta. Niente invio di messaggi o PR upstream. GPLv3, copyright, storia e attribuzioni conservati. Nessuna immagine di prodotto o risorsa esterna nuova necessaria.

Fuori perimetro: controllo quotidiano dei carichi, dashboard energetica, rilevamento infallibile di tutte le automazioni, conversione automatica universale delle automazioni esterne, ciclo misto, editor aperto a non amministratori, integrazioni cloud aggiuntive.

## Struttura delle schermate

### Stanze e inventario

Voce laterale HA «Pulsanti». Navigazione interna per area registrata; includere le stanze senza controller con stato vuoto. «Senza stanza» raccoglie dispositivi senza area; «Da associare» le configurazioni senza collegamento verificato. La stanza del controller resta distinta dalla stanza dei destinatari: una manopola può comandare un'altra stanza.

Inventario letto dal registro dispositivi, entità e aree, unito alle configurazioni Switch Manager. L'indice upstream usa soltanto switch_manager/configs e non basta. Non classificare automaticamente ogni dispositivo a batteria come pulsante. Catalogo iniziale di modelli verificati, configurazioni già gestite e aggiunta esplicita dal selettore dispositivi HA; dichiarare la copertura del riconoscimento automatico. Un dispositivo ambiguo rimane da associare, non viene nascosto o marcato compatibile. La lista manuale permette di includere qualsiasi controller registrato; senza blueprint validato l'editor applicativo resta bloccato con motivo leggibile.

Gruppi ordinati per produttore/modello, nomi ordinati secondo lingua. Mostrare nome, modello, riepilogo associazioni, gestione e compatibilità. Non mostrare batteria o ultimo evento quando le relative entità non sono disponibili. Ogni controller compare una volta; eventuali più configurazioni collegate restano visibili come associazioni, non vengono sovrascritte.

### Gestione e compatibilità

Due proprietà separate: gestione (Farhome / esterna dichiarata / da verificare) e compatibilità (blueprint verificato / da associare / non verificato). «Gestito esternamente» non implica «compatibile». «Da verificare» non implica «libero da automazioni».

Nessuna promessa di scoperta completa delle dipendenze: riferimenti diretti dispositivo/entità possono produrre suggerimenti, mai autorizzare una migrazione. Template, MQTT e script indiretti richiedono controllo esplicito. L'amministratore può dichiarare una gestione esterna e collegare gli identificativi delle automazioni e dell'helper interessati. Questi collegamenti servono a consultare, non modificano tali oggetti.

Dispositivi esterni: pagina in consultazione con riferimenti confermati e azione «Prepara configurazione». La nuova configurazione resta disabilitata finché non viene completata una migrazione separata. Il pannello non spegne automazioni esterne. Prima dell'attivazione di una nuova configurazione è obbligatorio dichiarare la verifica di eventuali gestori concorrenti; se vi sono associazioni note attive, impedirla fino alla risoluzione esplicita fuori dal flusso ordinario. Compatibilità sconosciuta impedisce il salvataggio come configurazione eseguibile.

### Dispositivo ed editor gesti

Desktop: elenco compatto e dettaglio affiancati; smartphone: elenco seguito da pagina dettaglio con ritorno alla stessa stanza. Intestazione dispositivo con nome, modello, stanza e gestione. Elenco solo dei tasti/gesti definiti nel blueprint; mantenere identità degli indici upstream, senza attribuire gesti sulla base del solo marchio. Riepilogo per gesto, ad esempio «Rotazione oraria · Aumenta velocità · Ventilatore».

Editor rapido: funzione, destinatario e parametri pertinenti. Esempi: alterna luce/presa/ventilatore; aumenta o riduci luminosità percentuale; aumenta o riduci velocità quando il ventilatore espone l'azione; attiva scena o esegui script. «Altre azioni» apre l'editor HA già integrato per qualsiasi sequenza valida, condizioni e ritardi. Azioni su aree/dispositivi sono ammesse nell'editor HA; i moduli rapidi iniziali usano entità per poter validare le capacità in modo preciso. Non cambiare il destinatario verso un'entità diversa perché quella precedente è indisponibile.

I moduli rapidi riconoscono esclusivamente sequenze di cui comprendono tutti i campi, inclusi mode/parametri. Una sequenza non riconosciuta resta «Sequenza avanzata», viene conservata integralmente ed editata nell'editor HA. Nessuna semplificazione distruttiva, troncamento a prima azione o trasformazione automatica. Sostituire una sequenza avanzata con una rapida richiede una scelta esplicita con riepilogo della sostituzione.

Salva per l'intero dispositivo e Annulla; navigazione ad altra stanza/dispositivo con modifiche pendenti richiede scelta salva/scarta/resta. Cambiare gesto nello stesso dispositivo conserva le modifiche in memoria. Salva disabilitato durante richiesta; successo solo dopo risposta backend. Errori mantengono la bozza; aggiornamento esterno produce conflitto, senza sovrascrittura silenziosa. Nessun invio di azioni ai carichi dalla schermata di configurazione.

### Modalità selettore

Due comportamenti selezionabili: destinatario fisso o selettore di luci. Il secondo usa un input_select esistente esplicitamente collegato. Il suo elenco contiene entity_id di luci e conserva l'ordine; il nome amichevole è presentazione, mai chiave. Il primo supporto riusa un helper esistente, non ne crea uno automaticamente. Collegamento dell'helper e modifiche dell'elenco avvengono soltanto nella configurazione Farhome attiva già migrata, non sulla scheda di un controller esterno.

Click «Seleziona luce successiva», rotazione «Regola luce selezionata»; doppio/hold restano liberi. Editor dell'elenco con aggiungi, rimuovi, sposta su/giù (anche da tastiera). Non permettere lista vuota, duplicati, tipi misti o entity_id mancanti; entità esistente ma temporaneamente unavailable può rimanere configurata, con avviso e senza sostituzione. Destinatario attivo letto dall'helper con stato «non disponibile» se il valore non è più valido; nessun valore inventato.

Il feedback visivo attualmente usato (due toggle a distanza di 500 ms) è una sequenza indipendente e modificabile da conservare nella migrazione, non un comportamento obbligatorio per tutte le manopole. Migrare un caso reale richiede mantenere percentuali, transizioni, mode, ritardi e funzioni doppio/hold.

Per evitare un falso salvataggio atomico di helper e configurazione, «Modifica elenco» è una modifica distinta con «Applica elenco» e riepilogo; non viene applicata dal Salva del dispositivo. Le modifiche devono essere persistenti dopo riavvio e ricaricamento: scelta tecnica proposta dal progettista. Il primo editor dell'elenco supporta solo helper creati dall'interfaccia HA, tramite la collezione persistente input_select e la relativa API WebSocket, preservando nome, icona, initial e gli altri campi esistenti. Non usare input_select.set_options come salvataggio persistente. Gli helper YAML si possono collegare e usare in esecuzione, ma l'elenco appare in sola lettura con indicazione «Definito in YAML»; la loro modifica resta nel file originale, senza conversione automatica.

Leggere la configurazione originale e controllarne la revisione prima dell'aggiornamento; se modificata da altri, chiedere ricaricamento. Eseguire l'aggiornamento persistente dietro endpoint amministrativo con blocco per helper e rileggere configurazione e stato prima del successo. Le API native della collezione HA non garantiscono una transazione con gli altri editor: un conflitto rilevato dopo la scrittura produce avviso e ricaricamento, senza tentare un ripristino che cancelli il lavoro altrui. Se viene rimossa l'opzione initial o quella attiva, l'editor richiede una nuova scelta valida nel riepilogo prima dell'applicazione; non la inventa. Se l'aggiornamento delle opzioni riesce ma quello dello stato attivo fallisce, comunicare l'esito parziale e consentire di correggere la selezione, senza ripetere alla cieca l'intera operazione. Verificare esito e dati riletti; non dichiarare un cambio riuscito se il valore attivo è invalido o non si legge. Se le opzioni sono condivise con altre automazioni, l'utente deve riconoscere il riepilogo delle dipendenze note prima dell'applicazione. Nessuna deduzione automatica che un helper sia esclusivo.

## Architettura proposta dal progettista

Queste sono scelte tecniche proposte, non ulteriori preferenze attribuite all'utente.

Estendere il pannello Lit esistente e il suo routing, con vista per stanza e dettaglio dispositivo; mantenere accessibile l'editor upstream durante lo sviluppo. Usare componenti, temi chiaro/scuro, tipografia e linguaggio visivo HA: non trasferire automaticamente il tema Grafite della Homepage. Italiano per i nuovi testi, predisposti a localizzazione senza cambiare le chiavi ereditate.

Inventario e associazioni risolti dal backend dell'integrazione con API HA e dati dell'integrazione. Non usare credenziali salvate nel frontend. WebSocket amministrativo restituisce DTO minimi e separa registry device_id, config_id, blueprint_id e identificatore eventi; non sono intercambiabili. Risolvere automaticamente soltanto collegamenti deterministici tramite i registri (per esempio event entity collegata a un dispositivo); per MQTT o identificatori ambigui conferma manuale del dispositivo e del blueprint. La scelta manuale non modifica registro o stanza HA.

Metadati Farhome in un archivio HA separato e versionato, gestito da homeassistant.helpers.storage.Store: mappa config_id-device_id, controller aggiunti manualmente, riferimenti esterni confermati, helper selettore e annotazioni di verifica. Non usare variables come contenitore di metadati. Assenza archivio = nessuna migrazione distruttiva. Configurazioni e sequenze eseguibili continuano nello storage upstream. Se una configurazione viene eliminata o duplicata, ripulire o creare separatamente i metadati, senza clonare alla cieca l'associazione fisica.

Non dedurre persistenza dei nuovi campi dal solo schema vol.ALLOW_EXTRA: ManagedSwitchConfig oggi seleziona attributi espliciti. L'archivio separato evita di alterare il formato delle sequenze; la coerenza config-metadati richiede un endpoint coordinato con validazione completa prima delle scritture. In caso di scrittura parziale riportare chiaramente l'esito e non abilitare un controller appena creato. Serializzare le operazioni per config e controllare una revisione calcolata su configurazione e metadati correnti per impedire aggiornamenti persi, anche attraverso l'editor originale.

Conservare event listener e motore script upstream; non creare una seconda automazione esecutiva per ogni gesto. Per il selettore generare sequenze HA standard che leggono l'helper al momento dell'evento: nessun target deciso nello stato del browser. La bozza client non esegue servizi. I nuovi endpoint validano privilegi, appartenenza delle entità, indici, blueprint e capacità; il controllo frontend è assistenza, non confine di sicurezza.

## Stati e accessibilità

Caricamento separato da stanza vuota; errore di lettura con Riprova senza azzerare la configurazione. Controller senza area o senza associazione resta raggiungibile. Entità/helper rimossi sono riferimenti da correggere; non cancellare automaticamente i gesti. Disponibilità e stato di gestione non dipendono dal solo colore. Tutti i controlli da tastiera, etichette visibili, focus mantenuto dopo salvataggio e riordino. Layout verificabile a 320, 390 e 1440 px, senza overflow orizzontale. Le dimensioni da tocco devono consentire l'uso mobile; niente trascinamento obbligatorio.

## Criteri di accettazione

- Cambiare stanza mostra i controller corrispondenti, ordinati per modello; senza stanza e non associati restano accessibili.
- Un HOBEIAN con selettore mostra elenco ordinato, target attivo e azioni indipendenti; un altro può avere un ventilatore come destinatario fisso.
- Rotazione ventilatore offre velocità solo quando supportata; luminosità non appare per un ventilatore.
- Ogni gesto configurabile conserva le sequenze avanzate senza perdita; salva/errori/conflitti/non salvato sono espliciti.
- Elenco helper e configurazione hanno applicazioni distinte e conferme reali dal backend; l'ordine salvato di un helper UI sopravvive a riavvio e ricaricamento. Un helper YAML è utilizzabile ma il suo elenco resta in sola lettura.
- Controller gestito esternamente non viene automaticamente migrato né attivato in parallelo.
- Test del backend coprono risoluzione inventario/associazioni, revisione concorrente, errori storage e validazione; test frontend coprono navigazione, conservazione sequenze e parametri per capacità. Build TypeScript/Rollup e test esistenti pertinenti devono passare.
- Collaudo reale e installazione richiedono approvazione separata, backup e piano di ritorno; nessuna promessa di compatibilità prima di verificare gli eventi e provare il dispositivo autorizzato.

## Decisioni lasciate all'implementatore e rischi

Nomi interni dei DTO/endpoint, suddivisione componenti e formato della revisione sono scelte dell'implementatore. Non serve un nuovo framework o libreria UI. Il catalogo iniziale dipende dai blueprint effettivamente verificati e deve dichiarare la propria copertura. La migrazione iniziale sarà guidata e manuale, su un solo controller; un importatore generalizzato richiederebbe una specifica successiva. Compatibilità con aggiornamenti del frontend HA, copertura del riconoscimento dispositivi e dipendenze indirette delle automazioni restano rischi da verificare, non risultati acquisiti.

## Verifica della proposta e fonti

Revisione indipendente di costruibilità completata sul documento: individuata e risolta l'ambiguità sulla persistenza delle opzioni input_select. Dopo la precisazione su helper UI e YAML, nessuna questione importante rimasta secondo il revisore. Questa revisione non equivale a implementazione, collaudo o approvazione dell'utente.

Fonti tecniche lette, senza modificare Home Assistant:

- [Tipi del frontend ereditato](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/frontend/src/types.ts), [indice](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/frontend/src/switch-manager-index.ts) ed [editor](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/frontend/src/switch-manager-switch-editor.ts).
- [Modelli](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/custom_components/switch_manager/models.py), [schema](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/custom_components/switch_manager/schema.py) e [WebSocket](https://github.com/Sazed70/Farhome-Switch-Manager/blob/8646d78f7485dbe6728634d0ef59b3edb597d750/custom_components/switch_manager/connections.py) ereditati.
- [input_select, Home Assistant Core 2026.11.0](https://github.com/home-assistant/core/blob/2026.11.0/homeassistant/components/input_select/__init__.py) e [collezioni persistenti e WebSocket](https://github.com/home-assistant/core/blob/2026.11.0/homeassistant/helpers/collection.py).
