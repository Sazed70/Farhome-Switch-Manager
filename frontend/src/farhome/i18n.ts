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
  configuration:['Configurazione','Configuration'],choose_configuration:['Scegli una configurazione','Choose a configuration'],
  add_button:['Aggiungi pulsante','Add controller'],registered_device:['Dispositivo registrato','Registered device'],add_to_list:['Aggiungi alla lista','Add to list'],
  associate_device:['Dispositivo da associare','Device to associate'],link_config:['Collega configurazione','Link configuration'],
  no_unassociated:['Nessuna configurazione da associare.','No unassigned configurations.'],
  blueprint:['Modello / blueprint','Model / blueprint'],identifier:['Identificatore eventi','Event identifier'],name:['Nome','Name'],
  create_draft:['Crea bozza disabilitata','Create disabled draft'],prepare:['Prepara configurazione Farhome','Prepare Farhome configuration'],
  external_notice:['La gestione esterna resta attiva. Puoi preparare una configurazione Farhome disabilitata; il passaggio richiede una verifica separata.','External management remains active. Prepare a disabled Farhome configuration; switching requires a separate check.'],
  no_config:['Non ci sono configurazioni associate a questo dispositivo.','No configuration is associated with this device.'],
  choose:['Scegli…','Choose…'],button:['Tasto','Button'],configure_quick:['Configura azione rapida','Configure quick action'],other_actions:['Altre azioni','Other actions'],
  no_action:['Nessuna azione','No action'],advanced_notice:['Questa sequenza viene conservata integralmente. Puoi modificarla nell’editor Home Assistant.','This sequence is preserved in full. Edit it with the Home Assistant editor.'],
  replace_advanced:['Sostituire la sequenza avanzata di questo gesto? Ritardi, condizioni e altre azioni saranno sostituiti dalla nuova azione rapida.','Replace this gesture’s advanced sequence? Delays, conditions and other actions will be replaced by the new quick action.'],
  replace:['Sostituisci questo gesto','Replace this gesture'],saved:['Salvato','Saved'],saving:['Salvataggio…','Saving…'],
  reload:['Ricarica dal server','Reload from server'],stay:['Resta','Stay'],discard:['Scarta','Discard'],save_leave:['Salva e prosegui','Save and continue'],
  leave_question:['Ci sono modifiche non salvate. Come vuoi proseguire?','There are unsaved changes. How do you want to continue?'],
  setup:['Associazione e attivazione','Binding and activation'],confirm_binding:['Ho verificato dispositivo fisico, blueprint e identificatore eventi.','I have verified the physical device, blueprint and event identifier.'],
  conflict_check:['Ho verificato che non esistono altri gestori attivi per questi eventi.','I have checked that no other active handlers use these events.'],
  enable:['Attiva configurazione','Enable configuration'],disable:['Disattiva configurazione','Disable configuration'],disabled:['Disabilitata','Disabled'],enabled:['Attiva','Enabled'],
  invalid_form:['Controlla destinatario, funzione e parametri prima di salvare.','Check target, function and parameters before saving.'],
  load_error:['Lettura non riuscita. Riprova.','Could not load. Try again.'],
  no_blueprint:['Blueprint non disponibile: usa l’editor originale per riparare la configurazione.','Blueprint unavailable: use the original editor to repair the configuration.'],
  migration_draft:['Bozza Farhome disabilitata: nessun gestore esterno viene modificato.','Disabled Farhome draft: external handlers are unchanged.'],
  no_options:['Nessuna azione supportata per questo destinatario.','No supported action for this target.'],
  loop:['Ripeti fino al rilascio','Repeat until release'],loop_interval:['Intervallo ripetizione (ms)','Repeat interval (ms)'],
  empty_list:['Nessun controller rilevato. Puoi aggiungerne uno dal registro dispositivi.','No controllers detected. Add one from the device registry.'],
} satisfies Record<string,readonly [string,string]>;
export type TextKey=keyof typeof it|keyof typeof extra;
export function t(language:string|undefined,key:TextKey):string{
  const italian=language?.startsWith('it');
  return key in extra?extra[key as keyof typeof extra][italian?0:1]:(italian?it:en)[key as keyof typeof it];
}
