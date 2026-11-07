const it={
  title:'Pulsanti',rooms:'Stanze',no_room:'Senza stanza',unassociated:'Da associare',
  gestures:'Gesti',function:'Funzione',target:'Destinatario',target_type:'Tipo di destinatario',
  light:'Luce',fan:'Ventilatore',switch:'Presa / interruttore',scene:'Scena',script:'Script',
  action_toggle:'Accendi / spegni',action_on:'Accendi',action_off:'Spegni',
  action_increase:'Aumenta',action_decrease:'Riduci',action_activate:'Attiva scena',action_run:'Esegui script',
  save:'Salva gesti',cancel:'Annulla',back:'Indietro',loading:'Caricamento…',retry:'Riprova',
  managed:'Configurato in Farhome',external:'Gestito esternamente',unknown:'Da verificare',
  verified:'Blueprint verificato',unverified:'Compatibilità da verificare',advanced:'Sequenza avanzata',
  dirty:'Modifiche non salvate',empty_room:'Nessun pulsante in questa stanza.',
  select_device:'Scegli un pulsante per configurare i gesti.',legacy:'Editor originale',
  unavailable:'Non disponibile',mode:'Modalità',step_brightness:'Passo luminosità (%)',step_speed:'Passo velocità (%)',
  transition:'Transizione (s)',brightness:'Luminosità (%)',kelvin:'Temperatura colore (K)',percentage:'Velocità (%)',
};
const en:Record<keyof typeof it,string>={
  title:'Buttons',rooms:'Rooms',no_room:'No room',unassociated:'Unassigned',
  gestures:'Gestures',function:'Function',target:'Target',target_type:'Target type',
  light:'Light',fan:'Fan',switch:'Plug / switch',scene:'Scene',script:'Script',
  action_toggle:'Toggle',action_on:'Turn on',action_off:'Turn off',
  action_increase:'Increase',action_decrease:'Decrease',action_activate:'Activate scene',action_run:'Run script',
  save:'Save gestures',cancel:'Cancel',back:'Back',loading:'Loading…',retry:'Retry',
  managed:'Configured in Farhome',external:'Managed externally',unknown:'To verify',
  verified:'Verified blueprint',unverified:'Compatibility unverified',advanced:'Advanced sequence',
  dirty:'Unsaved changes',empty_room:'No buttons in this room.',
  select_device:'Choose a button to configure its gestures.',legacy:'Original editor',
  unavailable:'Unavailable',mode:'Mode',step_brightness:'Brightness step (%)',step_speed:'Speed step (%)',
  transition:'Transition (s)',brightness:'Brightness (%)',kelvin:'Color temperature (K)',percentage:'Speed (%)',
};
const extra={
  selector:['Selettore di luci','Light selector'],helper:['Helper luci','Light helper'],link_helper:['Collega helper esistente','Link existing helper'],
  helper_pending:['Salva gesti per registrare il collegamento.','Save gestures to keep the link.'],
  helper_requires_disabled:['Disattiva la configurazione prima di collegare un elenco.','Disable the configuration before linking a list.'],
  create_light_list:['Crea nuovo elenco','Create a new list'],
  light_list_name:['Nome elenco luci','Light list name'],
  create_and_link:['Crea e collega','Create and link'],
  create_list_note:['I nuovi elenchi compaiono nella categoria Farhome degli Helper di Home Assistant. Usa Salva gesti per registrare il collegamento al pulsante.','New lists appear in the Farhome category on the Home Assistant Helpers page. Save gestures to keep the link to this controller.'],
  helper_name_exists:['Esiste già un elenco con questo nome. Cambia nome oppure collega l’elenco esistente.','A list with this name already exists. Choose another name or link the existing list.'],
  helper_created_unavailable:['L’elenco risulta salvato, ma l’entità helper non è ancora disponibile. Riprova o cercalo tra gli helper esistenti.','The list was saved, but the helper entity is unavailable. Try again or look for it among existing helpers.'],
  ordered_lights:['Elenco ordinato','Ordered lights'],active_light:['Luce attiva','Active light'],initial_light:['Luce iniziale','Initial light'],
  active_missing:['Destinatario attivo non disponibile','Active target unavailable'],no_initial:['Nessuna luce iniziale configurata','No initial light configured'],
  apply_list:['Applica elenco','Apply list'],list_applied:['Elenco applicato','List applied'],reload_list:['Ricarica elenco','Reload list'],
  add_light:['Aggiungi luce','Add light'],light_to_add:['Luce da aggiungere','Light to add'],up:['Sposta su','Move up'],down:['Sposta giù','Move down'],remove:['Rimuovi','Remove'],
  yaml_readonly:['Definito in YAML o origine non risolta: elenco in sola lettura.','Defined in YAML or unresolved origin: read-only list.'],
  controller_readonly:['Il controller deve essere attivo e migrato per modificare l’elenco.','The controller must be active and migrated to edit the list.'],
  known_dependencies:['Riferimenti conosciuti','Known references'],dependencies_notice:['Questo elenco può essere usato anche altrove. I riferimenti mostrati non sono un inventario completo delle dipendenze.','This list may be used elsewhere. The references shown are not a complete dependency inventory.'],
  dependencies_ack:['Ho verificato le dipendenze note di questo helper.','I have checked this helper’s known dependencies.'],
  list_invalid:['Scegli almeno una luce esistente, senza duplicati, e sostituisci le selezioni rimosse.','Choose at least one existing light without duplicates, and replace removed selections.'],
  helper_draft_pending:['Applica l’elenco o scartane la bozza prima di uscire; Salva gesti non modifica l’helper.','Apply the list or discard its draft before leaving; Save gestures does not change the helper.'],
  fixed_target:['Destinatario fisso','Fixed target'],use_selector:['Usa selettore per questo gesto','Use selector for this gesture'],confirm_selector:['Conferma gesto selettore','Confirm selector gesture'],
  selector_function:['Funzione selettore','Selector function'],next_light:['Seleziona luce successiva','Select next light'],dim_up:['Aumenta luminosità selezionata','Increase selected brightness'],dim_down:['Riduci luminosità selezionata','Decrease selected brightness'],
  selector_summary:['Verrà sostituito soltanto questo gesto. Gli altri gesti, inclusi doppio click, pressione prolungata e feedback avanzati, restano invariati.','Only this gesture will be replaced. Other gestures, including double click, hold and advanced feedback, stay unchanged.'],
  configuration:['Configurazione','Configuration'],choose_configuration:['Scegli una configurazione','Choose a configuration'],
  add_button:['Aggiungi pulsante','Add controller'],registered_device:['Dispositivo registrato','Registered device'],add_to_list:['Aggiungi alla lista','Add to list'],
  associate_device:['Dispositivo da associare','Device to associate'],link_config:['Collega configurazione','Link configuration'],
  no_unassociated:['Nessuna configurazione da associare.','No unassigned configurations.'],
  blueprint:['Modello / blueprint','Model / blueprint'],identifier:['Identificatore eventi','Event identifier'],name:['Nome','Name'],
  blueprint_use:['Usa suggerimento','Use suggestion'],
  blueprint_search:['Cerca blueprint','Search blueprints'],
  blueprint_no_results:['Nessun blueprint corrispondente.','No matching blueprints.'],
  blueprint_change:['Cambia blueprint','Change blueprint'],
  blueprint_change_preview:['Anteprima cambio blueprint','Blueprint change preview'],
  blueprint_change_apply:['Applica cambio alla bozza','Apply change to draft'],
  blueprint_change_notice:['Dopo il salvataggio, la configurazione andrà riattivata.','After saving, enable the configuration again.'],
  blueprint_change_keep:['Azioni mantenute','Actions kept'],
  blueprint_change_removed:['Gesti da riconfigurare','Gestures to configure again'],
  blueprint_change_identifier:['Inserisci l’identificatore eventi del nuovo blueprint.','Enter the new blueprint’s event identifier.'],
  blueprint_suggested:['Blueprint suggerito','Suggested blueprint'],
  blueprint_assigned:['Blueprint associato','Assigned blueprint'],
  blueprint_model_match:['Corrisponde al modello rilevato da Zigbee2MQTT.','Matches the model detected by Zigbee2MQTT.'],
  blueprint_mode_match:['Corrisponde al modello e alla modalità Zigbee2MQTT','Matches the model and Zigbee2MQTT mode'],
  blueprint_mode_unknown:['La modalità Zigbee2MQTT non è ancora disponibile. Scegli il profilo in base alla modalità del dispositivo.','The Zigbee2MQTT mode is not available yet. Choose the profile for the device mode.'],
  blueprint_if_event:['Se è in modalità eventi (event)','If set to event mode'],
  blueprint_if_command:['Se è in modalità a comandi','If set to command mode'],
  blueprint_no_suggestion:['Nessun blueprint suggerito. Verifica il modello e la modalità prima di scegliere dal catalogo.','No blueprint suggested. Check the model and mode before choosing from the catalog.'],
  create_draft:['Crea bozza disabilitata','Create disabled draft'],prepare:['Prepara configurazione Farhome','Prepare Farhome configuration'],
  external_notice:['La gestione esterna resta attiva. Puoi preparare una configurazione Farhome disabilitata; il passaggio richiede una verifica separata.','External management remains active. Prepare a disabled Farhome configuration; switching requires a separate check.'],
  no_config:['Non ci sono configurazioni associate a questo dispositivo.','No configuration is associated with this device.'],
  choose:['Scegli…','Choose…'],button:['Tasto','Button'],configure_quick:['Configura azione rapida','Configure quick action'],other_actions:['Altre azioni','Other actions'],
  no_action:['Nessuna azione','No action'],advanced_notice:['Questa sequenza viene conservata integralmente. Puoi modificarla nell’editor Home Assistant.','This sequence is preserved in full. Edit it with the Home Assistant editor.'],
  replace_advanced:['Sostituire la sequenza avanzata di questo gesto? Ritardi, condizioni e altre azioni saranno sostituiti dalla nuova azione rapida.','Replace this gesture’s advanced sequence? Delays, conditions and other actions will be replaced by the new quick action.'],
  replace:['Sostituisci questo gesto','Replace this gesture'],saved:['Salvato','Saved'],saving:['Salvataggio…','Saving…'],
  reload:['Ricarica dal server','Reload from server'],stay:['Resta','Stay'],discard:['Scarta','Discard'],save_leave:['Salva e prosegui','Save and continue'],
  leave_question:['Ci sono modifiche non salvate. Come vuoi proseguire?','There are unsaved changes. How do you want to continue?'],
  setup:['Associazione e attivazione','Binding and activation'],
  verify_activation:['Verifica prima di attivare','Verify before enabling'],
  verify_activation_details:['Controlla che dispositivo, blueprint e identificatore corrispondano e che nessun’altra automazione attiva usi questi eventi.','Check that the device, blueprint and identifier match and that no other active automation uses these events.'],
  confirm_activation:['Conferma e attiva','Confirm and enable'],
  enable:['Attiva configurazione','Enable configuration'],disable:['Disattiva configurazione','Disable configuration'],disabled:['Disabilitata','Disabled'],enabled:['Attiva','Enabled'],
  invalid_form:['Controlla destinatario, funzione e parametri prima di salvare.','Check target, function and parameters before saving.'],
  load_error:['Lettura non riuscita. Riprova.','Could not load. Try again.'],
  save_error:['Salvataggio non riuscito.','Could not save.'],
  activation_error:['Impossibile cambiare lo stato della configurazione.','Could not change the configuration status.'],
  error_conflict:['I dati sono stati modificati altrove. Ricarica prima di riprovare.','The data changed elsewhere. Reload before trying again.'],
  error_not_found:['L’elemento richiesto non è più disponibile.','The requested item is no longer available.'],
  error_validation:['I dati non sono validi. Controlla la configurazione e riprova.','The data is invalid. Check the configuration and try again.'],
  error_activation_blocked:['Controlla il dispositivo, il blueprint e le automazioni che usano gli stessi eventi. Il collegamento di un helper richiede una configurazione attiva e verificata.','Check the device, the blueprint and automations that use the same events. Linking a helper requires an active, verified configuration.'],
  error_activation_conflict:['Un’altra configurazione o automazione usa questi eventi. Controlla i gestori esistenti prima di attivare.','Another configuration or automation uses these events. Check the existing handlers before enabling.'],
  error_partial_write:['Le modifiche potrebbero essere state salvate solo in parte. Ricarica e verifica lo stato prima di riprovare.','Some changes may have been saved. Reload and check the current state before trying again.'],
  error_read_only:['L’elemento è in sola lettura.','This item is read-only.'],
  error_dependencies:['Conferma di aver controllato i riferimenti condivisi prima di applicare le modifiche.','Confirm that you checked the shared references before applying changes.'],
  error_replacement:['Scegli le luci attiva e iniziale prima di rimuoverle dall’elenco.','Choose replacements for the active and initial lights before removing them.'],
  error_helper:['Impossibile completare la richiesta al gestore degli helper.','Could not complete the request to the helper manager.'],
  error_unauthorized:['Questa operazione richiede i permessi di amministratore.','This operation requires administrator permissions.'],
  mqtt_unavailable:['MQTT non è disponibile.','MQTT is unavailable.'],
  zigbee2mqtt_not_discovered:['Nessuna istanza Zigbee2MQTT rilevata.','No Zigbee2MQTT instance detected.'],
  zigbee2mqtt_definitions_timeout:['Zigbee2MQTT non ha inviato tutti i dati dei dispositivi in tempo.','Zigbee2MQTT did not send all device data in time.'],
  inventory_warning:['Alcuni dati dei dispositivi non sono disponibili.','Some device data is unavailable.'],
  config_count_one:['configurazione','configuration'],config_count_many:['configurazioni','configurations'],
  reference_automation:['Automazione','Automation'],reference_config:['Configurazione','Configuration'],
  custom_zigbee2mqtt_image:['Zigbee2MQTT · Immagine personalizzata','Zigbee2MQTT · Custom image'],
  mode_single:['Singola','Single'],mode_restart:['Riavvia','Restart'],mode_queued:['In coda','Queued'],mode_parallel:['In parallelo','Parallel'],
  no_blueprint:['Blueprint non disponibile. Puoi sceglierne un altro in Associazione e attivazione.','Blueprint unavailable. Choose another in Binding and activation.'],
  migration_draft:['Bozza Farhome disabilitata: nessun gestore esterno viene modificato.','Disabled Farhome draft: external handlers are unchanged.'],
  no_options:['Nessuna azione supportata per questo destinatario.','No supported action for this target.'],
  loop:['Ripeti fino al rilascio','Repeat until release'],loop_interval:['Intervallo ripetizione (ms)','Repeat interval (ms)'],
  empty_list:['Nessun controller rilevato. Puoi aggiungerne uno dal registro dispositivi.','No controllers detected. Add one from the device registry.'],
} satisfies Record<string,readonly [string,string]>;
export type TextKey=keyof typeof it|keyof typeof extra;
export function uiLanguage(language:string|undefined):'it'|'en'{
  return language?.toLowerCase().split('-')[0]==='it'?'it':'en';
}
export function t(language:string|undefined,key:TextKey):string{
  const italian=uiLanguage(language)==='it';
  return key in extra?extra[key as keyof typeof extra][italian?0:1]:(italian?it:en)[key as keyof typeof it];
}

const errorKeys:Record<string,TextKey>={
  conflict:'error_conflict',not_found:'error_not_found',validation_error:'error_validation',
  invalid_format:'error_validation',activation_blocked:'error_activation_blocked',activation_conflict:'error_activation_conflict',
  partial_write:'error_partial_write',persistence_failed:'save_error',read_only:'error_read_only',
  dependencies_acknowledgment_required:'error_dependencies',replacement_required:'error_replacement',
  helper_api_error:'error_helper',unauthorized:'error_unauthorized',
  helper_name_exists:'helper_name_exists',helper_created_unavailable:'helper_created_unavailable',
};
export function errorKey(error:unknown,fallback:TextKey):TextKey{
  const code=(error as {code?:unknown}|null)?.code;
  return typeof code==='string'&&Object.hasOwn(errorKeys,code)?errorKeys[code]:fallback;
}
export function warningKey(code:string):TextKey{
  switch(code){
    case 'mqtt_unavailable':
    case 'zigbee2mqtt_not_discovered':
    case 'zigbee2mqtt_definitions_timeout':
      return code;
    default:
      return 'inventory_warning';
  }
}

// Translate the catalog's gesture labels for display while keeping the blueprint payload intact.
const gestures:Record<string,string>={
  press:'Pressione singola','single press':'Pressione singola',single:'Pressione singola',
  'press 2x':'Doppia pressione','double press':'Doppia pressione',double:'Doppia pressione',
  'press 3x':'Tripla pressione','press 4x':'Quattro pressioni','press 5x':'Cinque pressioni',
  'press >4x':'Più di quattro pressioni','press many times':'Pressioni ripetute',
  hold:'Pressione prolungata',long:'Pressione prolungata','long press':'Pressione prolungata',
  'hold (released)':'Rilascio dopo pressione prolungata',release:'Rilascio',released:'Rilascio',
  'hold (1s)':'Pressione prolungata (1 s)','either hold':'Pressione prolungata di un tasto',
  'hold (step down)':'Pressione prolungata per diminuire','hold (step up)':'Pressione prolungata per aumentare',
  'press (delayed)':'Pressione ritardata','press (on)':'Pressione di accensione','press (off)':'Pressione di spegnimento',
  'both press':'Pressione di entrambi i tasti','both press 2x':'Doppia pressione di entrambi i tasti',
  'both press 3x':'Tripla pressione di entrambi i tasti','both hold':'Pressione prolungata di entrambi i tasti',
  'both init':'Inizio della pressione di entrambi i tasti',init:'Inizio pressione',
  rotate:'Rotazione','rotate right':'Rotazione oraria','rotate left':'Rotazione antioraria',
  'rotate (stopped)':'Fine rotazione','rotate clockwise start':'Inizio rotazione oraria',
  'rotate clockwise stop':'Fine rotazione oraria','rotate anti-clockwise start':'Inizio rotazione antioraria',
  'rotate anti-clockwise stop':'Fine rotazione antioraria',
  'brightness step up':'Aumento luminosità','brightness step down':'Riduzione luminosità',
  'color temperature step up':'Aumento temperatura colore','color temperature step down':'Riduzione temperatura colore',
  'saturation move':'Variazione saturazione','hue move':'Variazione tonalità','hue stop':'Fine variazione tonalità',
  toggle:'Accensione / spegnimento','toggle s1':'Commutazione S1','toggle s2':'Commutazione S2',
  on:'Accensione',off:'Spegnimento',shake:'Scuotimento',fast:'Veloce',slow:'Lento',start:'Avvio',
  step:'Passo','step up':'Aumento','step down':'Riduzione',repeat:'Ripetizione',motion:'Movimento',person:'Presenza di una persona',
};
export function gestureTitle(language:string|undefined,title:string):string{
  const key=title.trim().toLowerCase();
  return uiLanguage(language)==='it'&&Object.hasOwn(gestures,key)?gestures[key]:title;
}
