import {LitElement,html,css,nothing} from 'lit';
import {customElement,property,state,query} from 'lit/decorators.js';
import {live} from 'lit/directives/live.js';
import {keyed} from 'lit/directives/keyed.js';
import {repeat} from 'lit/directives/repeat.js';
import type {Blueprint,Route} from '../types.js';
import {createEmptyConfig} from '../helpers.js';
import type {FarhomeHass,Controller,BlueprintChoice,ConfigEnvelope,EditableConfig,Binding,QuickAction,QuickPatch,Domain,ScriptMode,SelectorPatch,SelectorKind} from './types.js';
import {FarhomeApi} from './api.js';
import {t,TextKey,errorKey,gestureTitle} from './i18n.js';
import {controls} from './styles.js';
import {syncModalDialog} from './dialog.js';
import {matchingGestures,sharesIdentifier} from './blueprint-change.js';
import {buildQuickAction,parseQuickAction,supportedQuickActions,supportedAreaQuickActions,supportsBrightness,supportsColor,supportsColorTemperature,lightTemperatureRange,buildSelectorAction,parseSelectorAction} from './actions.js';
import {FarhomeSelectorEditor} from './selector-editor.js';
import './selector-editor.js';
import './light-settings.js';
import './thumbnail.js';

@customElement('farhome-device-editor')
export class FarhomeDeviceEditor extends LitElement{
  @property({attribute:false}) hass!:FarhomeHass;
  @property({attribute:false}) controller!:Controller;
  @property({attribute:false}) route?:Route;
  @property({attribute:false}) areas: {id:string;name:string}[] = [];
  @property({type:Boolean}) narrow=false;
  @state() private envelope?:ConfigEnvelope;
  @state() private draft?:EditableConfig;
  @state() private binding?:Binding;
  @state() private loading=false;
  @state() private busy=false;
  @state() private error?:TextKey;
  @state() private saved=false;
  @state() private dirty=false;
  @state() private selected='0:0';
  @state() private pickedConfig='';
  @state() private blueprints:Record<string,Blueprint>={};
  @state() private newBlueprint='';
  @state() private newIdentifier='';
  @state() private newName='';
  @state() private blueprintSearch='';
  @state() private changingBlueprint=false;
  @state() private preparing=false;
  @state() private showAdvanced=false;
  @state() private replacePending=false;
  @state() private activationPending=false;
  @state() private deletePending=false;
  @state() private helperChoice='';
  @state() private creatingSelector=false;
  @state() private helperDirty=false;
  @state() private helperBusy=false;
  @state() private selectorPending=false;
  @state() private selectorKind:SelectorKind='next';
  @state() private selectorStep=10;
  @state() private selectorTransition=.1;
  @query('dialog.delete-dialog') private deleteDialog?:HTMLDialogElement;
  @query('dialog.activation-dialog') private activationDialog?:HTMLDialogElement;
  @query('dialog.replace-dialog') private replaceDialog?:HTMLDialogElement;
  private quick=new Map<string,QuickAction>();
  protected selectors=new Map<string,SelectorPatch>();
  private token=0;
  private suggestedIdentifier=false;
  private text=(key:TextKey)=>t(this.hass?.language,key);
  private get api(){return new FarhomeApi(this.hass);}
  private get showsSetupForm(){return !this.draft&&!this.loading&&!this.readonly&&(!this.controller.config_ids.length||this.preparing);}
  private blueprintHint(){
    const suggestion=this.controller.blueprint_suggestion;
    const assigned=this.blueprint;
    if(!suggestion){
      if(assigned)return html`<p class="muted">${this.text('blueprint_assigned')} · ${assigned.name}</p>`;
      return this.controller.config_ids.length?nothing:html`<p class="muted">${this.text('blueprint_no_suggestion')}</p>`;
    }
    const conditional=suggestion.reason==='mode_unknown';
    const reason=suggestion.reason==='mode'
      ? `${this.text('blueprint_mode_match')} «${suggestion.mode}».`
      : suggestion.reason==='gestures'?undefined:this.text(conditional?'blueprint_mode_unknown':'blueprint_model_match');
    const choices=suggestion.alternative?[suggestion,suggestion.alternative]:[suggestion];
    return html`<div class="notice">
      <h3>${this.text('blueprint_suggested')}</h3>
      ${reason?html`<p class="muted">${reason}</p>`:nothing}
      ${choices.map(choice=>html`<div class="row blueprint-choice">
        <p>${conditional?`${this.text(choice.mode==='event'?'blueprint_if_event':'blueprint_if_command')} · `:nothing}<strong>${choice.name}</strong></p>
        ${this.showsSetupForm?html`<button type="button" aria-label=${`${this.text('blueprint_use')} · ${choice.name}`}
          ?disabled=${!this.blueprints[choice.id]} @click=${()=>this.applySuggestion(choice)}>${this.text('blueprint_use')}</button>`:nothing}
      </div>`)}
      ${assigned?html`<p>${this.text('blueprint_assigned')} · ${assigned.name}</p>`:nothing}
    </div>`;
  }
  get hasDirty(){return this.dirty||this.hasHelperDirty;}
  get hasHelperDirty(){return this.helperDirty||this.creatingSelector;}
  get saving(){return this.busy||this.helperBusy;}
  protected get readonly(){return this.controller.management==='external'&&!this.preparing;}
  protected get blueprint(){return typeof this.draft?.blueprint==='object'?this.draft.blueprint:undefined;}
  protected get indices(){return this.selected.split(':').map(Number);}
  protected get action(){const [b,a]=this.indices;return this.draft?.buttons[b]?.actions[a];}
  protected get currentQuick(){
    const draft=this.quick.get(this.selected);
    if(draft)return draft;
    const saved=this.action?parseQuickAction(this.action):null;
    if(saved?.rgb_color){
      const entity=saved.entity_id?this.hass.states[saved.entity_id]:undefined;
      if(!entity||!supportsColor(entity))return null;
    }
    return saved;
  }

  protected updated(changed:Map<string,unknown>){
    if(changed.has('controller')){
      const previous=changed.get('controller') as Controller|undefined;
      if(previous?.device_id!==this.controller.device_id||(!this.draft&&previous.config_ids.length!==this.controller.config_ids.length))this.openController();
    }
    syncModalDialog(this.deleteDialog,this.deletePending&&!!this.envelope);
    syncModalDialog(this.activationDialog,this.activationPending);
    syncModalDialog(this.replaceDialog,this.replacePending);
  }
  private async openController(){
    this.deletePending=false;
    this.token++;this.envelope=undefined;this.draft=undefined;this.binding=undefined;this.error=undefined;this.saved=false;this.loading=false;this.preparing=false;this.pickedConfig='';this.activationPending=false;this.creatingSelector=false;this.helperDirty=false;this.helperBusy=false;this.helperChoice='';this.quick.clear();this.selectors.clear();this.resetSetupForm();this.markDirty(false);
    if(this.controller.config_ids.length===1){this.pickedConfig=this.controller.config_ids[0];await this.load(this.pickedConfig);}
    else if(!this.controller.config_ids.length)await this.loadBlueprints();
  }
  private async loadBlueprints(){try{const result=await this.hass.callWS<{blueprints:Record<string,Blueprint>}>({type:'switch_manager/blueprints'});this.blueprints=result.blueprints;}catch(err){this.error=errorKey(err,'load_error');}}
  private adopt(value:ConfigEnvelope){
    this.deletePending=false;
    this.envelope=value;this.draft=structuredClone(value.config);this.binding={...(value.metadata||{device_id:this.controller.device_id})};this.quick.clear();this.selectors.clear();this.markDirty(false);this.activationPending=false;this.changingBlueprint=false;this.selected='0:0';this.showAdvanced=false;this.selectorPending=false;
  }
  async load(id:string){const token=++this.token;this.loading=true;this.error=undefined;try{const value=await this.api.get(id);if(token===this.token)this.adopt(value);}catch(err){if(token===this.token)this.error=errorKey(err,'load_error');}finally{if(token===this.token)this.loading=false;}}
  private emitDirty(){this.dispatchEvent(new CustomEvent('dirty-changed',{detail:{dirty:this.hasDirty},bubbles:true,composed:true}));}
  private markDirty(value=true){this.dirty=value;this.saved=false;this.emitDirty();}
  private changed(){this.draft={...this.draft!};this.markDirty();}
  private setQuick(value:QuickAction){
    if(this.busy||this.readonly)return;
    this.quick.set(this.selected,value);
    this.selectors.delete(this.selected);
    try{const [b,a]=this.indices;this.draft!.buttons[b].actions[a]=buildQuickAction(value);this.error=undefined;}catch{this.error='invalid_form';}
    this.showAdvanced=false;this.changed();
  }
  private useQuick(){
    if(this.action?.sequence.length&&!this.currentQuick){this.replacePending=true;return;}
    this.replaceWithQuick();
  }
  private replaceWithQuick(){
    this.replacePending=false;
    const entity=Object.values(this.hass.states).find(entity=>supportedQuickActions(entity,this.hass.services).length);
    const domain=(entity?.entity_id.split('.')[0]||'light') as Domain;
    this.setQuick({domain,entity_id:entity?.entity_id||'',kind:entity?supportedQuickActions(entity,this.hass.services)[0].kind:'on',mode:(this.action?.mode||'restart') as ScriptMode});
  }
  private changeTarget(value:QuickAction,target:string){
    if(target.startsWith('area:')){
      const area_id=target.slice(5);
      const {step,entity_id,percentage,rgb_color,...shared}=value;
      const next:QuickAction={...shared,area_id};
      if(!['toggle','on','off'].includes(next.kind))next.kind='toggle';
      this.setQuick(next);
      return;
    }
    const {area_id,...shared}=value;
    const next:QuickAction={...shared,entity_id:target};
    if(area_id){
      delete next.brightness_pct;
      delete next.color_temp_kelvin;
      delete next.transition;
    }
    const entity=this.hass.states[target];
    if(next.domain==='light'&&entity){
      if(!supportsBrightness(entity))delete next.brightness_pct;
      if(!supportsColor(entity))delete next.rgb_color;
      if(next.color_temp_kelvin!==undefined){
        const [min,max]=lightTemperatureRange(entity);
        if(!supportsColorTemperature(entity)||next.color_temp_kelvin<min||next.color_temp_kelvin>max)delete next.color_temp_kelvin;
      }
    }
    const options=supportedQuickActions(entity,this.hass.services);
    if(options.length&&!options.some(x=>x.kind===next.kind)){
      this.changeKind(next,options[0].kind);
      return;
    }
    this.setQuick(next);
  }
  private selectDomain(value:QuickAction,domain:Domain){
    const entity=Object.values(this.hass.states).find(item=>item.entity_id.startsWith(domain+'.')&&supportedQuickActions(item,this.hass.services).length);
    const kind=supportedQuickActions(entity,this.hass.services)[0]?.kind??(domain==='scene'?'activate':domain==='script'?'run':'on');
    const {step,transition,brightness_pct,color_temp_kelvin,rgb_color,percentage,area_id,...shared}=value;
    this.setQuick({...shared,domain,entity_id:entity?.entity_id||'',kind,...(['increase','decrease'].includes(kind)?{step:10}:{})});
  }
  private changeKind(value:QuickAction,kind:QuickAction['kind']){
    const {step,brightness_pct,color_temp_kelvin,rgb_color,percentage,...shared}=value;
    const next:QuickAction={...shared,kind};
    if(kind==='increase'||kind==='decrease')next.step=step??10;
    if(value.domain==='light'&&(kind==='on'||kind==='toggle')){
      if(brightness_pct!==undefined)next.brightness_pct=brightness_pct;
      if(color_temp_kelvin!==undefined)next.color_temp_kelvin=color_temp_kelvin;
      if(rgb_color!==undefined)next.rgb_color=rgb_color;
    }
    if(value.domain==='fan'&&kind==='on'&&percentage!==undefined)next.percentage=percentage;
    this.setQuick(next);
  }
  private advancedChanged(event:CustomEvent){if(this.busy||this.readonly||!Array.isArray(event.detail.value))return;const [b,a]=this.indices;this.draft!.buttons[b].actions[a]={...this.action!,sequence:structuredClone(event.detail.value)};this.quick.delete(this.selected);this.selectors.delete(this.selected);this.changed();}
  private numeric(label:TextKey,key:keyof QuickAction,value:QuickAction,min:number,max?:number,optional=false){return html`<label>${this.text(label)}<input type="number" min=${min} max=${max??nothing} step="any" .value=${String(value[key]??'')} ?required=${!optional} ?disabled=${this.busy||this.readonly} @input=${(e:Event)=>{const input=e.target as HTMLInputElement;const next={...value};if(optional&&!input.value)delete next[key];else if(Number.isFinite(input.valueAsNumber))(next as any)[key]=input.valueAsNumber;else return;this.setQuick(next);}}></label>`;}
  private quickForm(value:QuickAction){
    const isArea=!!value.area_id;
    const entity=!isArea&&value.entity_id?this.hass.states[value.entity_id]:undefined;
    const options=isArea?supportedAreaQuickActions():supportedQuickActions(entity,this.hass.services);
    const selectedTarget=isArea?`area:${value.area_id}`:(value.entity_id||'');
    const areas=this.areas||[];
    const roomPrefix=value.domain==='light'?this.text('all_lights_in'):this.text('all_devices_in');
    const lightTurnOn=value.domain==='light'&&['on','toggle'].includes(value.kind);
    return html`<div class="fields">
      <label>${this.text('target_type')}<select aria-label=${this.text('target_type')} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>this.selectDomain(value,(e.target as HTMLSelectElement).value as Domain)}>${(['light','fan','switch','scene','script'] as Domain[]).map(domain=>html`<option value=${domain} .selected=${domain===value.domain}>${this.text(domain)}</option>`)}</select></label>
      <label>${this.text('target')}<select aria-label=${this.text('target')} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>this.changeTarget(value,(e.target as HTMLSelectElement).value)}>
        <option value="" .selected=${!selectedTarget}>${this.text('choose')}</option>
        ${['light','fan','switch'].includes(value.domain)&&areas.length?html`
          <optgroup label=${this.text('rooms')}>
            ${areas.map(area=>html`<option value=${`area:${area.id}`} .selected=${selectedTarget===`area:${area.id}`}>${roomPrefix} ${area.name}</option>`)}
          </optgroup>`:nothing}
        <optgroup label=${this.text('individual_entities')}>
          ${!entity&&!isArea&&value.entity_id?html`<option value=${value.entity_id} .selected=${true}>${value.entity_id} · ${this.text('unavailable')}</option>`:nothing}
          ${Object.values(this.hass.states).filter(item=>item.entity_id.startsWith(value.domain+'.')).sort((a,b)=>String(a.attributes.friendly_name||a.entity_id).localeCompare(String(b.attributes.friendly_name||b.entity_id),this.hass.language)).map(item=>html`<option value=${item.entity_id} .selected=${item.entity_id===value.entity_id}>${item.attributes.friendly_name||item.entity_id}${item.state==='unavailable'?' · '+this.text('unavailable'):''}</option>`)}
        </optgroup>
      </select></label>
      <label>${this.text('function')}<select aria-label=${this.text('function')} ?disabled=${this.busy||this.readonly||!options.length} @change=${(e:Event)=>this.changeKind(value,(e.target as HTMLSelectElement).value as QuickAction['kind'])}>${!options.some(x=>x.kind===value.kind)?html`<option value=${value.kind} .selected=${true}>${this.text(('action_'+value.kind) as TextKey)} · ${this.text('unavailable')}</option>`:nothing}${options.map(option=>html`<option value=${option.kind} .selected=${option.kind===value.kind}>${this.text(option.label_key as TextKey)}</option>`)}</select></label>
      ${!isArea&&['increase','decrease'].includes(value.kind)?this.numeric(value.domain==='fan'?'step_speed':'step_brightness','step',value,.1,100):nothing}
      ${value.domain==='light'?this.numeric('transition','transition',value,0,3600,true):nothing}
      ${lightTurnOn&&isArea?this.numeric('brightness','brightness_pct',value,0,100,true):nothing}
      ${lightTurnOn&&isArea?this.numeric('kelvin','color_temp_kelvin',value,1,undefined,true):nothing}
      ${value.domain==='fan'&&value.kind==='on'&&(Number(entity?.attributes.supported_features)&1)?this.numeric('percentage','percentage',value,0,100,true):nothing}
    </div>${lightTurnOn&&entity&&supportsBrightness(entity)?keyed(`${this.draft?.id}:${this.selected}:${entity.entity_id}`,html`
      <farhome-light-settings .value=${value} .entity=${entity} .language=${this.hass.language} .disabled=${this.busy||this.readonly}
        @light-settings-change=${(event:CustomEvent<QuickAction>)=>this.setQuick(event.detail)}></farhome-light-settings>`):nothing}
    ${!options.length?html`<p class="notice">${this.text('no_options')}</p>`:nothing}`;
  }
  private async prepare(){
    this.preparing=true;this.error=undefined;
    if(this.draft){this.draft={...structuredClone(this.draft),id:null,enabled:false,name:this.draft.name+' Farhome'};this.envelope=undefined;this.binding={device_id:this.controller.device_id,verified:false};this.markDirty();}
    else await this.loadBlueprints();
  }
  private resetSetupForm(){
    this.newName='';
    this.newBlueprint='';
    this.newIdentifier='';
    this.blueprintSearch='';
    this.changingBlueprint=false;
    this.suggestedIdentifier=false;
  }
  private selectBlueprint(id:string){
    if(id!==this.newBlueprint&&this.suggestedIdentifier){
      this.newIdentifier='';
      this.suggestedIdentifier=false;
    }
    this.newBlueprint=id;
    this.markDirty();
  }
  private applySuggestion(choice:BlueprintChoice){
    this.selectBlueprint(choice.id);
    if(!this.newName.trim())this.newName=this.controller.name.slice(0,255);
    if(choice.identifier&&choice.identifier.length<=1024){
      this.newIdentifier=choice.identifier;
      this.suggestedIdentifier=true;
    }
    this.blueprintSearch='';
    this.error=undefined;
  }
  private blueprintPicker(onSelect:(id:string)=>void){
    const terms=this.blueprintSearch.trim().toLocaleLowerCase(this.hass.language).split(/\s+/).filter(Boolean);
    const suggestion=this.controller.blueprint_suggestion;
    const catalog=Object.values(this.blueprints).sort((a,b)=>a.name.localeCompare(b.name,this.hass.language)||a.service.localeCompare(b.service,this.hass.language));
    const results=catalog.filter(blueprint=>{
      const model=blueprint.id===suggestion?.id||blueprint.id===suggestion?.alternative?.id?this.controller.model:'';
      const searchable=`${blueprint.name} ${blueprint.id} ${blueprint.service} ${model}`.toLocaleLowerCase(this.hass.language);
      return terms.every(term=>searchable.includes(term));
    });
    const selected=this.blueprints[this.newBlueprint];
    const options=selected&&!results.includes(selected)?[selected,...results]:results;
    return html`
      <label>${this.text('blueprint_search')}<input type="search" .value=${this.blueprintSearch}
        @input=${(e:Event)=>this.blueprintSearch=(e.target as HTMLInputElement).value}
        @keydown=${(e:KeyboardEvent)=>{if(e.key==='Enter')e.preventDefault();}}></label>
      <label>${this.text('blueprint')}<select required @change=${(e:Event)=>onSelect((e.target as HTMLSelectElement).value)}>
        <option value="" .selected=${live(!this.newBlueprint)}>${this.text('choose')}</option>
        ${repeat(options,value=>value.id,value=>html`<option value=${value.id} .selected=${live(value.id===this.newBlueprint)}>${value.name} · ${value.service}</option>`)}
      </select></label>
      ${terms.length&&!results.length?html`<p class="muted" role="status">${this.text('blueprint_no_results')}</p>`:nothing}`;
  }
  private setupForm(){
    return html`<form class="stack" @submit=${(e:Event)=>{e.preventDefault();this.createDraft();}}>
      <p>${this.text('no_config')}</p>
      <label>${this.text('name')}<input required maxlength="255" .value=${this.newName} @input=${(e:Event)=>{this.newName=(e.target as HTMLInputElement).value;this.markDirty();}}></label>
      ${this.blueprintPicker(id=>this.selectBlueprint(id))}
      <label>${this.text('identifier')}<input required maxlength="1024" .value=${this.newIdentifier} @input=${(e:Event)=>{this.newIdentifier=(e.target as HTMLInputElement).value;this.suggestedIdentifier=false;this.markDirty();}}></label>
      <button type="submit">${this.text('create_draft')}</button>
    </form>`;
  }
  private async openBlueprintChange(){
    this.newBlueprint=this.blueprint?.id||'';
    this.blueprintSearch='';
    this.changingBlueprint=true;
    this.error=undefined;
    await this.loadBlueprints();
  }
  private blueprintChange(){
    const next=this.blueprints[this.newBlueprint];
    const before=this.blueprint;
    const changed=next&&next.id!==before?.id;
    const matches=changed?matchingGestures(before,next):new Map<string,string>();
    const configured=this.draft!.buttons.flatMap((button,b)=>button.actions.flatMap((action,a)=>
      action.sequence.length?[{b,a,key:`${b}:${a}`,title:before?.buttons[b]?.actions[a]?.title}]:[]));
    const removed=configured.filter(item=>!matches.has(item.key));
    return html`<section class="notice stack" aria-label=${this.text('blueprint_change_preview')}>
      ${this.blueprintPicker(id=>this.newBlueprint=id)}
      ${changed?html`<p>${this.text('blueprint_change_notice')}</p>
        <p>${this.text('blueprint_change_keep')} · ${configured.length-removed.length}</p>
        ${removed.length?html`<div><p>${this.text('blueprint_change_removed')} · ${removed.length}</p><ul>
          ${removed.map(({b,a,title})=>html`<li>${this.text('button')} ${b+1} · ${title?gestureTitle(this.hass.language,title):a+1}</li>`)}
        </ul></div>`:nothing}`:nothing}
      <div class="actions"><button ?disabled=${!changed||this.saving||this.hasHelperDirty} @click=${()=>this.applyBlueprintChange(next,matches)}>${this.text('blueprint_change_apply')}</button>
        <button @click=${()=>this.changingBlueprint=false}>${this.text('cancel')}</button></div>
    </section>`;
  }
  private applyBlueprintChange(next:Blueprint,matches:Map<string,string>){
    const draft=this.draft!;
    const template=createEmptyConfig(next);
    const before=this.blueprint;
    const quick=new Map<string,QuickAction>();
    const selectors=new Map<string,SelectorPatch>();
    for(const [from,to] of matches){
      const [oldButton,oldAction]=from.split(':').map(Number);
      const [button,action]=to.split(':').map(Number);
      const existing=draft.buttons[oldButton]?.actions[oldAction];
      if(!existing)continue;
      template.buttons[button].actions[action]=existing;
      const quickAction=this.quick.get(from);
      if(quickAction)quick.set(to,quickAction);
      const selector=this.selectors.get(from);
      if(selector)selectors.set(to,{...selector,button,action});
    }
    const suggestion=this.controller.blueprint_suggestion;
    const suggested=suggestion?.id===next.id?suggestion:suggestion?.alternative?.id===next.id?suggestion.alternative:undefined;
    const identifier=sharesIdentifier(before,next)&&draft.identifier?draft.identifier:suggested?.identifier||'';
    this.draft={...draft,blueprint:next,buttons:template.buttons,enabled:false,identifier,valid_blueprint:true,is_mismatch:false};
    this.quick=quick;
    this.selectors=selectors;
    this.selected=matches.get(this.selected)||'0:0';
    this.showAdvanced=false;
    this.selectorPending=false;
    this.changingBlueprint=false;
    this.error=undefined;
    this.markDirty();
  }
  private async createDraft(){
    const blueprint=this.blueprints[this.newBlueprint];if(!blueprint||!this.newIdentifier.trim()||!this.newName.trim()){this.error='invalid_form';return;}
    this.draft={...createEmptyConfig(blueprint),id:null,name:this.newName,identifier:this.newIdentifier,enabled:false};this.binding={device_id:this.controller.device_id,verified:false};this.selected='0:0';this.showAdvanced=false;this.selectorPending=false;this.preparing=true;this.markDirty();
  }
  async save(forNavigation=false):Promise<boolean>{
    if(this.creatingSelector||(forNavigation&&this.helperDirty)){this.error='helper_draft_pending';return false;}
    if(this.saving||!this.draft||this.readonly||this.changingBlueprint)return false;
    if(!this.draft.identifier.trim()){this.error='blueprint_change_identifier';return false;}
    const inputs=this.renderRoot.querySelectorAll('input');for(const input of inputs)if(!input.reportValidity())return false;
    this.busy=true;this.error=undefined;
    try{
      const quick_actions:QuickPatch[]=Array.from(this.quick,([key,value])=>{buildQuickAction(value);const [button,action]=key.split(':').map(Number);return {button,action,value};});
      const response=await this.api.save(structuredClone(this.draft),this.binding,this.envelope?.revision,quick_actions,Array.from(this.selectors.values()));
      const selected=this.selected;this.adopt(response);this.selected=selected;this.saved=true;
      this.dispatchEvent(new CustomEvent('save',{detail:response,bubbles:true,composed:true}));return true;
    }catch(err){this.error=errorKey(err,'save_error');return false;}finally{this.busy=false;}
  }
  discard(){this.renderRoot.querySelector<FarhomeSelectorEditor>('farhome-selector-editor')?.discard();this.creatingSelector=false;this.helperDirty=false;if(this.envelope)this.adopt(this.envelope);else{this.draft=undefined;this.resetSetupForm();this.markDirty(false);}this.dispatchEvent(new CustomEvent('cancel',{bubbles:true,composed:true}));}
  private async toggle(manualConfirmation=false){
    if(!this.envelope||this.hasDirty||this.saving)return;
    this.activationPending=false;this.busy=true;this.error=undefined;
    try{
      const value=await this.api.setEnabled(this.envelope.config_id,!this.draft!.enabled,this.envelope.revision,manualConfirmation);
      this.adopt(value);
      this.dispatchEvent(new CustomEvent('save',{detail:value,bubbles:true,composed:true}));
    }catch(err){
      if(!manualConfirmation&&(err as {code?:string}|null)?.code==='activation_confirmation_required')this.activationPending=true;
      else this.error=errorKey(err,'activation_error');
    }finally{this.busy=false;}
  }
  private get canDelete(){return !!this.envelope&&!this.loading&&!this.saving&&!this.hasDirty&&!this.changingBlueprint;}
  private closeDeleteConfirmation(){
    this.deletePending=false;
    this.updateComplete.then(()=>this.renderRoot.querySelector<HTMLButtonElement>('[data-delete-configuration]')?.focus());
  }
  private async deleteConfiguration(){
    if(!this.canDelete)return;
    const envelope=this.envelope!;
    this.deletePending=false;
    this.busy=true;this.error=undefined;
    try{
      await this.api.deleteConfig(envelope.config_id,envelope.revision);
      this.envelope=undefined;this.draft=undefined;this.binding=undefined;this.pickedConfig='';
      this.dispatchEvent(new Event('delete',{bubbles:true,composed:true}));
    }catch(err){this.error=errorKey(err,'delete_configuration_error');}
    finally{this.busy=false;}
  }
  private get canEditHelper(){return !!this.envelope&&!!this.draft?.enabled&&!!this.binding?.verified&&!!this.binding?.conflicts_checked;}
  private setCreatingSelector(open:boolean){
    this.creatingSelector=open;
    this.helperDirty=false;
    this.emitDirty();
  }
  private helperDraftChanged(event:CustomEvent){
    this.helperDirty=event.detail.dirty;
    this.helperBusy=event.detail.busy;
    this.emitDirty();
  }
  private linkSelector(helper:string){
    const previous=this.binding!.selector_helper;
    if(helper===previous)return;
    this.draft!.buttons.forEach((button,b)=>button.actions.forEach((action,a)=>{
      const selected=parseSelectorAction(action);
      if(!selected||selected.helper_id!==previous)return;
      const {kind,step,transition,mode}=selected;
      const generated=buildSelectorAction(helper,kind,step,transition,mode);
      button.actions[a]={...action,...generated};
      this.selectors.set(`${b}:${a}`,{button:b,action:a,kind,step,transition,mode:generated.mode as ScriptMode});
    }));
    this.binding={...this.binding!,selector_helper:helper};
    this.helperChoice='';
    this.changed();
  }
  protected selectorSection(){
    if(this.readonly)return nothing;
    const helper=this.binding?.selector_helper;
    const savedHelper=this.envelope?.metadata?.selector_helper;
    const canLink=!this.draft?.enabled||this.canEditHelper;
    const blocked=this.saving||this.helperDirty;
    const options=Object.values(this.hass.states).filter(entity=>/^input_select\.[a-z0-9_]+$/.test(entity.entity_id)
      &&Array.isArray(entity.attributes.options)&&entity.attributes.options.length>0
      &&entity.attributes.options.every((id:unknown)=>typeof id==='string'&&/^light\.[a-z0-9_]+$/.test(id)&&!!this.hass.states[id]));
    return html`<details class="card" open=${helper||this.creatingSelector?true:nothing}><summary><span>${this.text('selector')}${helper?html` <small class="muted">· ${helper}</small>`:nothing}</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="details-body stack setup">
      ${!canLink?html`<p class="muted">${this.text('helper_requires_disabled')}</p>`:this.creatingSelector?html`<farhome-selector-editor creating .hass=${this.hass} .suggestedName=${`${this.draft!.name} · ${this.text('selector')}`.slice(0,255)}
        @selector-created=${(e:CustomEvent<{entity_id:string}>)=>{this.setCreatingSelector(false);this.linkSelector(e.detail.entity_id);}}
        @selector-create-cancel=${()=>this.setCreatingSelector(false)} @helper-dirty-changed=${this.helperDraftChanged}></farhome-selector-editor>`:html`
        <div class="fields"><label>${this.text('helper')}<select aria-label=${this.text('helper')} ?disabled=${blocked} @change=${(e:Event)=>this.helperChoice=(e.target as HTMLSelectElement).value}>
          <option value="" .selected=${!this.helperChoice}>${this.text('choose')}</option>
          ${options.map(entity=>html`<option value=${entity.entity_id} .selected=${entity.entity_id===this.helperChoice}>${entity.attributes.friendly_name||entity.entity_id}</option>`)}
        </select></label><button ?disabled=${blocked||!options.some(entity=>entity.entity_id===this.helperChoice&&helper!==this.helperChoice)} @click=${()=>this.linkSelector(this.helperChoice)}>${this.text('link_helper')}</button></div>
        <div class="actions"><button ?disabled=${blocked} @click=${()=>this.setCreatingSelector(true)}>${this.text('create_light_list')}</button></div>`}
      ${helper?html`<p class="muted">${this.hass.states[helper]?.attributes.friendly_name||helper}</p>`:nothing}
      ${helper&&helper!==savedHelper?html`<p class="notice">${this.text('helper_pending')}</p>`:nothing}
      ${!this.creatingSelector&&helper&&helper===savedHelper&&this.envelope?html`<farhome-selector-editor .hass=${this.hass} .entityId=${helper} .configId=${this.envelope.config_id} .allowed=${this.canEditHelper&&!this.busy} @helper-dirty-changed=${this.helperDraftChanged}></farhome-selector-editor>`:nothing}
    </div></details>`;
  }
  private applySelector(){const helper=this.binding?.selector_helper;if(this.busy||this.readonly||!helper||!this.action)return;try{const [button,action]=this.indices;const value={button,action,kind:this.selectorKind,step:this.selectorStep,transition:this.selectorTransition,mode:this.action.mode as ScriptMode};const generated=buildSelectorAction(helper,value.kind,value.step,value.transition,value.mode);this.draft!.buttons[button].actions[action]=generated;this.quick.delete(this.selected);this.selectors.set(this.selected,{...value,mode:generated.mode as ScriptMode});this.selectorPending=false;this.showAdvanced=false;this.changed();}catch{this.error='invalid_form';}}
  protected selectorGesture(){
    const helper=this.binding?.selector_helper;
    if(!helper||this.readonly||!this.action)return nothing;
    const configured=parseSelectorAction(this.action);
    const options=this.hass.states[helper]?.attributes.options;
    const canDim=Array.isArray(options)&&options.length>0&&options.every((id:unknown)=>typeof id==='string'&&this.hass.states[id]&&supportsBrightness(this.hass.states[id]));
    const activeKind=canDim?this.selectorKind:'next';
    return html`${configured?html`<p class="notice">${this.text('selector')} · ${configured.helper_id} · ${this.text(configured.kind==='next'?'next_light':configured.kind==='brightness_up'?'dim_up':'dim_down')}</p>`:nothing}
      <button ?disabled=${this.busy} @click=${()=>{this.selectorKind=canDim?(configured?.kind||'next'):'next';this.selectorStep=configured?.step??10;this.selectorTransition=configured?.transition??.1;this.selectorPending=!this.selectorPending;}}>${this.text('use_selector')}</button>
      ${this.selectorPending?html`<div class="notice stack"><p>${this.text('selector_summary')}</p><label>${this.text('selector_function')}<select aria-label=${this.text('selector_function')} ?disabled=${this.busy} @change=${(e:Event)=>this.selectorKind=(e.target as HTMLSelectElement).value as SelectorKind}>${(['next','brightness_up','brightness_down'] as SelectorKind[]).map(kind=>html`<option value=${kind} ?disabled=${kind!=='next'&&!canDim} .selected=${kind===activeKind}>${this.text(kind==='next'?'next_light':kind==='brightness_up'?'dim_up':'dim_down')}</option>`)}</select></label>${!canDim?html`<p class="muted">${this.text('selector_no_dim')}</p>`:nothing}${activeKind!=='next'?html`<div class="fields"><label>${this.text('step_brightness')}<input type="number" min="0.1" max="100" step="any" .value=${String(this.selectorStep)} ?disabled=${this.busy} @input=${(e:Event)=>{const n=(e.target as HTMLInputElement).valueAsNumber;if(Number.isFinite(n))this.selectorStep=n;}}></label><label>${this.text('transition')}<input type="number" min="0" max="3600" step="any" .value=${String(this.selectorTransition)} ?disabled=${this.busy} @input=${(e:Event)=>{const n=(e.target as HTMLInputElement).valueAsNumber;if(Number.isFinite(n))this.selectorTransition=n;}}></label></div>`:nothing}<button ?disabled=${this.busy} @click=${()=>{if(!canDim)this.selectorKind='next';this.applySelector();}}>${this.text('confirm_selector')}</button></div>`:nothing}`;
  }
  render(){
    if(!this.controller)return nothing;
    const blueprint=this.blueprint;const action=this.action;const quick=this.currentQuick;const selector=action&&parseSelectorAction(action);
    const queuedFeedback=selector?.kind==='next'&&action!.sequence.length>1;
    return html`<section class="stack editor-root" aria-label=${this.controller.name}>
      <header class="device-heading">
        <div class="device-heading-main">
          <farhome-thumbnail large .asset=${this.controller.image}></farhome-thumbnail>
          <div class="device-heading-copy">
            <div class="row">
              <h2>${this.controller.name}</h2>
              ${this.draft?html`<span class="badge ${this.draft.enabled?'active':'inactive'}"><span class="badge-dot" aria-hidden="true"></span>${this.text(this.draft.enabled?'enabled':'disabled')}</span>`:nothing}
            </div>
            <p class="muted">${this.controller.manufacturer} ${this.controller.model}</p>
            <p class="status">${this.text(this.controller.management==='farhome'?'managed':this.controller.management==='external'?'external':'unknown')} · ${this.text(this.controller.compatibility==='verified'?'verified':'unverified')}</p>
          </div>
        </div>
        ${!this.readonly&&this.envelope&&this.draft?html`<button ?disabled=${this.saving||this.hasDirty||this.changingBlueprint} @click=${()=>this.toggle()}>${this.text(this.draft.enabled?'disable':'enable')}</button>`:nothing}
      </header>
      ${this.blueprintHint()}
      ${this.error?html`<div class="notice" role="alert">${this.text(this.error)}${!this.draft?html` <button @click=${()=>this.pickedConfig?this.load(this.pickedConfig):this.loadBlueprints()}>${this.text('retry')}</button>`:nothing}</div>`:nothing}
      ${this.loading?html`<p role="status">${this.text('loading')}</p>`:nothing}
      ${this.controller.config_ids.length>1?html`<label>${this.text('configuration')}<select .value=${this.pickedConfig} ?disabled=${this.hasDirty||this.saving} @change=${(e:Event)=>{this.pickedConfig=(e.target as HTMLSelectElement).value;if(this.pickedConfig)this.load(this.pickedConfig);}}><option value="">${this.text('choose_configuration')}</option>${this.controller.config_ids.map(id=>html`<option value=${id}>${id}</option>`)}</select></label>`:nothing}
      ${this.readonly?html`<p class="notice">${this.text('external_notice')}</p><button ?disabled=${this.busy||this.loading} @click=${this.prepare}>${this.text('prepare')}</button>`:nothing}
      ${this.showsSetupForm?this.setupForm():nothing}
      ${this.draft?html`
        ${!blueprint?html`<p class="notice">${this.text('no_blueprint')}</p>`:html`
          <div class="gesture-tabs" role="group" aria-label=${this.text('gestures')}>${blueprint.buttons.flatMap((button,b)=>button.actions.map((item,a)=>{const key=`${b}:${a}`;const configured=(this.draft?.buttons[b]?.actions[a]?.sequence.length||0)>0||this.quick.has(key)||this.selectors.has(key);return html`<button class=${configured?'configured':''} data-gesture=${key} aria-pressed=${key===this.selected} ?disabled=${this.busy} @click=${()=>{this.selected=key;this.showAdvanced=false;this.selectorPending=false;}}>${blueprint.buttons.length>1?`${this.text('button')} ${b+1} · `:''}${gestureTitle(this.hass.language,item.title)}</button>`;}))}</div>
          ${action?html`<div class="gesture-editor stack">
            <div class="gesture-header">
              <h3>${gestureTitle(this.hass.language,blueprint.buttons[this.indices[0]].actions[this.indices[1]].title)}</h3>
              <div class="segmented">
                ${!this.readonly?html`<button type="button" aria-pressed=${!this.showAdvanced&&!selector} @click=${this.useQuick} ?disabled=${this.busy}>${this.text('configure_quick')}</button>`:nothing}
                <button type="button" aria-pressed=${this.showAdvanced} @click=${()=>this.showAdvanced=!this.showAdvanced} ?disabled=${this.busy}>${this.text('other_actions')}</button>
              </div>
            </div>
            ${quick&&!this.showAdvanced?this.quickForm(quick):selector&&!this.showAdvanced?nothing:html`<p>${this.text(action.sequence.length?'advanced':'no_action')}</p>${action.sequence.length?html`<p class="muted">${this.text('advanced_notice')}</p>`:nothing}`}
            ${this.selectorGesture()}
            ${this.showAdvanced?html`<ha-automation-action .hass=${this.hass} .actions=${action.sequence} .disabled=${this.busy||this.readonly} .narrow=${this.narrow} @value-changed=${this.advancedChanged}></ha-automation-action>`:nothing}
            <label>${this.text('mode')}<select aria-label=${this.text('mode')} ?disabled=${this.busy||this.readonly||queuedFeedback} @change=${(e:Event)=>{action.mode=(e.target as HTMLSelectElement).value;if(quick)this.quick.set(this.selected,{...quick,mode:action.mode as ScriptMode});const selectorPatch=this.selectors.get(this.selected);if(selectorPatch)this.selectors.set(this.selected,{...selectorPatch,mode:action.mode as ScriptMode});this.changed();}}>${(['single','restart','queued','parallel'] as const).map(mode=>html`<option value=${mode} .selected=${mode===(queuedFeedback?'queued':action.mode)}>${this.text(`mode_${mode}`)}</option>`)}</select></label>
            ${blueprint.buttons[this.indices[0]].actions[this.indices[1]].release_index!=null?html`<label class="check"><input type="checkbox" .checked=${!!action.loop} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>{action.loop=(e.target as HTMLInputElement).checked;if(quick)this.quick.set(this.selected,{...quick,loop:action.loop});this.changed();}}>${this.text('loop')}</label>${action.loop?html`<label>${this.text('loop_interval')}<input type="number" min="50" max="5000" step="1" .value=${String(action.loop_interval??250)} ?disabled=${this.busy||this.readonly} @input=${(e:Event)=>{const n=(e.target as HTMLInputElement).valueAsNumber;if(!Number.isFinite(n))return;action.loop_interval=n;if(quick)this.quick.set(this.selected,{...quick,loop_interval:n});this.changed();}}></label>`:nothing}`:nothing}
          </div>`:nothing}`}
        ${this.selectorSection()}
        ${!this.readonly?html`<details class="card" ?open=${this.changingBlueprint||!this.draft.identifier.trim()}>
          <summary><span>${this.text('setup')}</span><svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><div class="details-body stack setup">
          <label>${this.text('name')}<input .value=${this.draft.name} maxlength="255" required ?disabled=${this.busy} @input=${(e:Event)=>{this.draft!.name=(e.target as HTMLInputElement).value;this.changed();}}></label>
          <label>${this.text('identifier')}<input .value=${this.draft.identifier} maxlength="1024" required ?disabled=${this.busy} @input=${(e:Event)=>{this.draft!.identifier=(e.target as HTMLInputElement).value;this.changed();}}></label>
          ${this.changingBlueprint?this.blueprintChange():html`<div><button ?disabled=${this.saving||this.hasHelperDirty} @click=${this.openBlueprintChange}>${this.text('blueprint_change')}</button></div>`}
          </div></details>`:nothing}
        <footer class="sticky-footer">
          <div class="row">
            ${!this.readonly?html`
              <button class="primary" ?disabled=${this.saving||this.creatingSelector||this.changingBlueprint||!this.dirty||!blueprint} @click=${()=>this.save()}>${this.text('save')}</button>
              <button ?disabled=${this.saving||!this.dirty} @click=${this.discard}>${this.text('cancel')}</button>
            `:nothing}
            <span class=${`status-pill ${this.dirty?'dirty':''}`} role="status">${this.text(this.busy?'saving':this.saved?'saved':this.dirty?'dirty':this.draft.enabled?'enabled':'disabled')}</span>
          </div>
          ${this.envelope?html`<button class="danger-ghost" data-delete-configuration ?disabled=${!this.canDelete} @click=${()=>this.deletePending=true}>${this.text('delete_configuration')}</button>`:nothing}
        </footer>
      `:nothing}
      ${this.envelope?html`<dialog class="delete-dialog" aria-label=${this.text('delete_configuration')} @cancel=${(e:Event)=>{e.preventDefault();this.closeDeleteConfirmation();}}>
        <h3>${this.text('delete_configuration')}</h3>
        <p><strong>${this.envelope.config.name} · ID ${this.envelope.config_id}</strong></p>
        <p class="muted">${this.text('delete_configuration_notice')}</p>
        <div class="actions">
          <button class="delete-confirm" @click=${this.deleteConfiguration}>${this.text('delete_configuration_confirm')}</button>
          <button autofocus @click=${this.closeDeleteConfirmation}>${this.text('cancel')}</button>
        </div>
      </dialog>`:nothing}
      <dialog class="activation-dialog" aria-label=${this.text('verify_activation')} @cancel=${(e:Event)=>{e.preventDefault();this.activationPending=false;}}>
        <h3>${this.text('verify_activation')}</h3>
        <p class="muted">${this.text('verify_activation_details')}</p>
        <div class="actions">
          <button class="primary" @click=${()=>this.toggle(true)}>${this.text('confirm_activation')}</button>
          <button autofocus @click=${()=>this.activationPending=false}>${this.text('cancel')}</button>
        </div>
      </dialog>
      <dialog class="replace-dialog" aria-label=${this.text('replace')} @cancel=${(e:Event)=>{e.preventDefault();this.replacePending=false;}}>
        <h3>${this.text('replace')}</h3>
        <p class="muted">${this.text('replace_advanced')}</p>
        <div class="actions">
          <button class="primary" @click=${this.replaceWithQuick}>${this.text('replace')}</button>
          <button autofocus @click=${()=>this.replacePending=false}>${this.text('cancel')}</button>
        </div>
      </dialog>
    </section>`;
  }
  static styles=[controls,css`
    .editor-root{padding:24px 28px 0}
    section.notice{padding:14px}
    .delete-confirm{background:var(--fh-danger);border-color:var(--fh-danger);color:#fff;font-weight:600}
    .delete-confirm:hover:not(:disabled){filter:brightness(1.06);background:var(--fh-danger)}
    .blueprint-choice{margin-top:8px;justify-content:space-between}
    .device-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding-bottom:18px;border-bottom:1px solid var(--fh-border)}
    .device-heading-main{display:flex;align-items:center;gap:16px;min-width:0}
    .device-heading-copy{min-width:0;display:grid;gap:4px}
    h2{overflow-wrap:anywhere;line-height:1.35}
    .gesture-tabs{display:flex;gap:8px;flex-wrap:wrap}
    .gesture-tabs button{display:inline-flex;align-items:center;gap:8px;font-size:13px;text-align:left;min-height:36px;padding:6px 12px;border-radius:var(--fh-radius-pill)}
    .gesture-tabs button::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--fh-border);flex:none}
    .gesture-tabs button.configured::before{background:var(--fh-accent)}
    .gesture-tabs [aria-pressed=true]{color:var(--fh-accent);border-color:var(--fh-accent);background:color-mix(in srgb,var(--fh-accent) 10%,var(--fh-surface));font-weight:600}
    .gesture-editor{padding:18px 20px;border-radius:var(--fh-radius);background:var(--fh-surface-subtle);border:1px solid var(--fh-border)}
    .gesture-header{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .sticky-footer{position:sticky;bottom:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:4px -28px 0;padding:14px 28px;background:var(--fh-surface);border-top:1px solid var(--fh-border)}
    .status-pill{font-size:12px;color:var(--fh-muted);font-weight:500}
    .status-pill.dirty{color:var(--fh-warning);font-weight:600}
    .setup{padding-top:12px}
    ha-automation-action{min-width:0}
    @media(max-width:600px){
      .editor-root{padding:18px 16px 0}
      .sticky-footer{margin:4px -16px 0;padding:12px 16px}
      .device-heading{align-items:flex-start;gap:12px}
      .device-heading h2{font-size:18px}
      farhome-thumbnail[large]{width:60px;height:60px}
    }
  `];
}
