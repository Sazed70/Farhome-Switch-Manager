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
export type TextKey=keyof typeof it;
export function t(language:string|undefined,key:TextKey):string{return language?.startsWith('it')?it[key]:en[key];}
