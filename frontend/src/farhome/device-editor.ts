import {LitElement,html,css,nothing} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import type {Blueprint,Route} from '../types.js';
import {createEmptyConfig} from '../helpers.js';
import type {FarhomeHass,Controller,ConfigEnvelope,EditableConfig,Binding,QuickAction,QuickPatch,Domain,ScriptMode,SelectorPatch} from './types.js';
import {FarhomeApi} from './api.js';
import {t,TextKey} from './i18n.js';
import {controls} from './styles.js';
import {buildQuickAction,parseQuickAction,supportedQuickActions,supportsBrightness} from './actions.js';
import './thumbnail.js';

@customElement('farhome-device-editor')
export class FarhomeDeviceEditor extends LitElement{
  @property({attribute:false}) hass!:FarhomeHass;
  @property({attribute:false}) controller!:Controller;
  @property({attribute:false}) route?:Route;
  @property({type:Boolean}) narrow=false;
  @state() private envelope?:ConfigEnvelope;
  @state() private draft?:EditableConfig;
  @state() private binding?:Binding;
  @state() private loading=false;
  @state() private busy=false;
  @state() private error='';
  @state() private saved=false;
  @state() private dirty=false;
  @state() private selected='0:0';
  @state() private pickedConfig='';
  @state() private blueprints:Record<string,Blueprint>={};
  @state() private newBlueprint='';
  @state() private newIdentifier='';
  @state() private newName='';
  @state() private preparing=false;
  @state() private showAdvanced=false;
  @state() private replacePending=false;
  @state() private conflictChecked=false;
  private quick=new Map<string,QuickAction>();
  protected selectors=new Map<string,SelectorPatch>();
  private token=0;
  private text=(key:TextKey)=>t(this.hass?.language,key);
  private get api(){return new FarhomeApi(this.hass);}
  get hasDirty(){return this.dirty;}
  get saving(){return this.busy;}
  protected get readonly(){return this.controller.management==='external'&&!this.preparing;}
  protected get blueprint(){return typeof this.draft?.blueprint==='object'?this.draft.blueprint:undefined;}
  protected get indices(){return this.selected.split(':').map(Number);}
  protected get action(){const [b,a]=this.indices;return this.draft?.buttons[b]?.actions[a];}
  protected get currentQuick(){return this.quick.get(this.selected)|| (this.action?parseQuickAction(this.action):null);}

  protected updated(changed:Map<string,unknown>){
    if(changed.has('controller')&&(changed.get('controller') as Controller|undefined)?.device_id!==this.controller.device_id)this.openController();
  }
  private async openController(){
    this.token++;this.envelope=undefined;this.draft=undefined;this.binding=undefined;this.error='';this.saved=false;this.preparing=false;this.pickedConfig='';this.quick.clear();this.selectors.clear();this.markDirty(false);
    if(this.controller.config_ids.length===1){this.pickedConfig=this.controller.config_ids[0];await this.load(this.pickedConfig);}
    else if(!this.controller.config_ids.length)await this.loadBlueprints();
  }
  private async loadBlueprints(){try{const result=await this.hass.callWS<{blueprints:Record<string,Blueprint>}>({type:'switch_manager/blueprints'});this.blueprints=result.blueprints;}catch(err){this.error=this.message(err);}}
  private message(err:unknown){const value=err as {message?:string;code?:string};return value?.message||value?.code||this.text('load_error');}
  private adopt(value:ConfigEnvelope){
    this.envelope=value;this.draft=structuredClone(value.config);this.binding={...(value.metadata||{device_id:this.controller.device_id})};this.quick.clear();this.selectors.clear();this.markDirty(false);this.conflictChecked=false;this.selected='0:0';this.showAdvanced=false;
  }
  async load(id:string){const token=++this.token;this.loading=true;this.error='';try{const value=await this.api.get(id);if(token===this.token)this.adopt(value);}catch(err){if(token===this.token)this.error=this.message(err);}finally{if(token===this.token)this.loading=false;}}
  private markDirty(value=true){this.dirty=value;this.saved=false;this.dispatchEvent(new CustomEvent('dirty-changed',{detail:{dirty:value},bubbles:true,composed:true}));}
  private changed(){this.draft={...this.draft!};this.markDirty();}
  private setQuick(value:QuickAction){
    this.quick.set(this.selected,value);
    try{const [b,a]=this.indices;this.draft!.buttons[b].actions[a]=buildQuickAction(value);this.error='';}catch{this.error=this.text('invalid_form');}
    this.showAdvanced=false;this.changed();
  }
  private useQuick(){
    if(this.action?.sequence.length&&!parseQuickAction(this.action)){this.replacePending=true;return;}
    this.replaceWithQuick();
  }
  private replaceWithQuick(){
    this.replacePending=false;
    const entity=Object.values(this.hass.states).find(entity=>supportedQuickActions(entity,this.hass.services).length);
    const domain=(entity?.entity_id.split('.')[0]||'light') as Domain;
    this.setQuick({domain,entity_id:entity?.entity_id||'',kind:entity?supportedQuickActions(entity,this.hass.services)[0].kind:'on',mode:(this.action?.mode||'restart') as ScriptMode});
  }
  private changeTarget(value:QuickAction,entity_id:string){const entity=this.hass.states[entity_id];const kinds=supportedQuickActions(entity,this.hass.services);const kind=kinds.some(x=>x.kind===value.kind)?value.kind:kinds[0]?.kind||'on';this.setQuick({domain:entity_id.split('.')[0] as Domain,entity_id,kind,mode:value.mode,...(['increase','decrease'].includes(kind)?{step:10}:{} )});}
  private selectDomain(value:QuickAction,domain:Domain){const entity=Object.values(this.hass.states).find(entity=>entity.entity_id.startsWith(domain+'.')&&supportedQuickActions(entity,this.hass.services).length);if(entity)this.changeTarget(value,entity.entity_id);else this.setQuick({domain,entity_id:'',kind:domain==='scene'?'activate':domain==='script'?'run':'on',mode:value.mode});}
  private changeKind(value:QuickAction,kind:QuickAction['kind']){this.setQuick({domain:value.domain,entity_id:value.entity_id,mode:value.mode,kind,...(['increase','decrease'].includes(kind)?{step:10}:{} )});}
  private advancedChanged(event:CustomEvent){if(this.busy||this.readonly||!Array.isArray(event.detail.value))return;const [b,a]=this.indices;this.draft!.buttons[b].actions[a]={...this.action!,sequence:structuredClone(event.detail.value)};this.quick.delete(this.selected);this.selectors.delete(this.selected);this.changed();}
  private numeric(label:TextKey,key:keyof QuickAction,value:QuickAction,min:number,max?:number,optional=false){return html`<label>${this.text(label)}<input type="number" min=${min} max=${max??nothing} step="any" .value=${String(value[key]??'')} ?required=${!optional} ?disabled=${this.busy||this.readonly} @input=${(e:Event)=>{const input=e.target as HTMLInputElement;const next={...value};if(optional&&!input.value)delete next[key];else (next as any)[key]=input.valueAsNumber;this.setQuick(next);}}></label>`;}
  private quickForm(value:QuickAction){
    const entity=this.hass.states[value.entity_id];const options=supportedQuickActions(entity,this.hass.services);
    return html`<div class="fields">
      <label>${this.text('target_type')}<select aria-label=${this.text('target_type')} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>this.selectDomain(value,(e.target as HTMLSelectElement).value as Domain)}>${(['light','fan','switch','scene','script'] as Domain[]).map(domain=>html`<option value=${domain} .selected=${domain===value.domain}>${this.text(domain)}</option>`)}</select></label>
      <label>${this.text('target')}<select aria-label=${this.text('target')} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>this.changeTarget(value,(e.target as HTMLSelectElement).value)}><option value="" .selected=${!value.entity_id}>${this.text('choose')}</option>${!entity&&value.entity_id?html`<option value=${value.entity_id} .selected=${true}>${value.entity_id} · ${this.text('unavailable')}</option>`:nothing}${Object.values(this.hass.states).filter(entity=>entity.entity_id.startsWith(value.domain+'.')).sort((a,b)=>String(a.attributes.friendly_name||a.entity_id).localeCompare(String(b.attributes.friendly_name||b.entity_id),this.hass.language)).map(entity=>html`<option value=${entity.entity_id} .selected=${entity.entity_id===value.entity_id}>${entity.attributes.friendly_name||entity.entity_id}${entity.state==='unavailable'?' · '+this.text('unavailable'):''}</option>`)}</select></label>
      <label>${this.text('function')}<select aria-label=${this.text('function')} ?disabled=${this.busy||this.readonly||!options.length} @change=${(e:Event)=>this.changeKind(value,(e.target as HTMLSelectElement).value as QuickAction['kind'])}>${!options.some(x=>x.kind===value.kind)?html`<option value=${value.kind} .selected=${true}>${this.text(('action_'+value.kind) as TextKey)} · ${this.text('unavailable')}</option>`:nothing}${options.map(option=>html`<option value=${option.kind} .selected=${option.kind===value.kind}>${this.text(option.label_key as TextKey)}</option>`)}</select></label>
      ${['increase','decrease'].includes(value.kind)?this.numeric(value.domain==='fan'?'step_speed':'step_brightness','step',value,.1,100):nothing}
      ${value.domain==='light'?this.numeric('transition','transition',value,0,3600,true):nothing}
      ${value.domain==='light'&&['on','toggle'].includes(value.kind)&&entity&&supportsBrightness(entity)?this.numeric('brightness','brightness_pct',value,0,100,true):nothing}
      ${value.domain==='light'&&['on','toggle'].includes(value.kind)&&entity?.attributes.supported_color_modes?.includes('color_temp')?this.numeric('kelvin','color_temp_kelvin',value,entity.attributes.min_color_temp_kelvin||1,entity.attributes.max_color_temp_kelvin,true):nothing}
      ${value.domain==='fan'&&value.kind==='on'&&(Number(entity?.attributes.supported_features)&1)?this.numeric('percentage','percentage',value,0,100,true):nothing}
    </div>${!options.length?html`<p class="notice">${this.text('no_options')}</p>`:nothing}`;
  }
  private async prepare(){
    this.preparing=true;this.error='';
    if(this.draft){this.draft={...structuredClone(this.draft),id:null,enabled:false,name:this.draft.name+' Farhome'};this.envelope=undefined;this.binding={device_id:this.controller.device_id,verified:false};this.markDirty();}
    else await this.loadBlueprints();
  }
  private async createDraft(){
    const blueprint=this.blueprints[this.newBlueprint];if(!blueprint||!this.newIdentifier.trim()||!this.newName.trim()){this.error=this.text('invalid_form');return;}
    this.draft={...createEmptyConfig(blueprint),id:null,name:this.newName,identifier:this.newIdentifier,enabled:false};this.binding={device_id:this.controller.device_id,verified:false};this.preparing=true;this.markDirty();
  }
  async save():Promise<boolean>{
    if(this.busy||!this.draft||this.readonly)return false;
    const inputs=this.renderRoot.querySelectorAll('input');for(const input of inputs)if(!input.reportValidity())return false;
    this.busy=true;this.error='';
    try{
      const quick_actions:QuickPatch[]=Array.from(this.quick,([key,value])=>{buildQuickAction(value);const [button,action]=key.split(':').map(Number);return {button,action,value};});
      const response=await this.api.save(structuredClone(this.draft),this.binding,this.envelope?.revision,quick_actions,Array.from(this.selectors.values()));
      const selected=this.selected;this.adopt(response);this.selected=selected;this.saved=true;
      this.dispatchEvent(new CustomEvent('save',{detail:response,bubbles:true,composed:true}));return true;
    }catch(err){this.error=this.message(err);return false;}finally{this.busy=false;}
  }
  discard(){if(this.envelope)this.adopt(this.envelope);else{this.draft=undefined;this.markDirty(false);}this.dispatchEvent(new CustomEvent('cancel',{bubbles:true,composed:true}));}
  private async toggle(){if(!this.envelope||this.dirty||this.busy)return;this.busy=true;this.error='';try{const value=await this.api.setEnabled(this.envelope.config_id,!this.draft!.enabled,this.envelope.revision,this.conflictChecked);this.adopt(value);this.dispatchEvent(new CustomEvent('save',{detail:value,bubbles:true,composed:true}));}catch(err){this.error=this.message(err);}finally{this.busy=false;}}
  protected selectorSection(){return nothing;}
  protected selectorGesture(){return nothing;}
  render(){
    if(!this.controller)return nothing;
    const blueprint=this.blueprint;const action=this.action;const quick=this.currentQuick;
    return html`<section class="stack" aria-label=${this.controller.name}>
      <header class="device-heading"><farhome-thumbnail large .asset=${this.controller.image}></farhome-thumbnail><div><h2>${this.controller.name}</h2><p class="muted">${this.controller.manufacturer} ${this.controller.model}</p><p class="status">${this.text(this.controller.management==='farhome'?'managed':this.controller.management==='external'?'external':'unknown')} · ${this.text(this.controller.compatibility==='verified'?'verified':'unverified')}</p></div></header>
      ${this.error?html`<div class="notice" role="alert">${this.error}${!this.draft?html` <button @click=${()=>this.pickedConfig?this.load(this.pickedConfig):this.loadBlueprints()}>${this.text('retry')}</button>`:nothing}</div>`:nothing}
      ${this.loading?html`<p role="status">${this.text('loading')}</p>`:nothing}
      ${this.controller.config_ids.length>1?html`<label>${this.text('configuration')}<select .value=${this.pickedConfig} ?disabled=${this.dirty||this.busy} @change=${(e:Event)=>{this.pickedConfig=(e.target as HTMLSelectElement).value;if(this.pickedConfig)this.load(this.pickedConfig);}}><option value="">${this.text('choose_configuration')}</option>${this.controller.config_ids.map(id=>html`<option value=${id}>${id}</option>`)}</select></label>`:nothing}
      ${this.readonly?html`<p class="notice">${this.text('external_notice')}</p><button ?disabled=${this.busy||this.loading} @click=${this.prepare}>${this.text('prepare')}</button>`:nothing}
      ${!this.draft&&!this.loading&&(!this.controller.config_ids.length||this.preparing)?html`<form class="stack" @submit=${(e:Event)=>{e.preventDefault();this.createDraft();}}><p>${this.text('no_config')}</p><label>${this.text('name')}<input required maxlength="255" .value=${this.newName} @input=${(e:Event)=>{this.newName=(e.target as HTMLInputElement).value;this.markDirty();}}></label><label>${this.text('blueprint')}<select required .value=${this.newBlueprint} @change=${(e:Event)=>{this.newBlueprint=(e.target as HTMLSelectElement).value;this.markDirty();}}><option value="">${this.text('choose')}</option>${Object.values(this.blueprints).sort((a,b)=>a.name.localeCompare(b.name,this.hass.language)).map(value=>html`<option value=${value.id}>${value.service} · ${value.name}</option>`)}</select></label><label>${this.text('identifier')}<input required maxlength="1024" .value=${this.newIdentifier} @input=${(e:Event)=>{this.newIdentifier=(e.target as HTMLInputElement).value;this.markDirty();}}></label><button type="submit">${this.text('create_draft')}</button></form>`:nothing}
      ${this.draft?html`
        ${!blueprint?html`<p class="notice">${this.text('no_blueprint')}</p>`:html`
          <div class="gesture-tabs" role="group" aria-label=${this.text('gestures')}>${blueprint.buttons.flatMap((button,b)=>button.actions.map((item,a)=>{const key=`${b}:${a}`;return html`<button data-gesture=${key} aria-pressed=${key===this.selected} ?disabled=${this.busy} @click=${()=>{this.selected=key;this.showAdvanced=false;}}>${blueprint.buttons.length>1?`${this.text('button')} ${b+1} · `:''}${item.title}</button>`;}))}</div>
          ${action?html`<div class="gesture-editor stack"><h3>${blueprint.buttons[this.indices[0]].actions[this.indices[1]].title}</h3>
            ${quick&&!this.showAdvanced?this.quickForm(quick):html`<p>${this.text(action.sequence.length?'advanced':'no_action')}</p>${action.sequence.length?html`<p class="muted">${this.text('advanced_notice')}</p>`:nothing}`}
            ${this.selectorGesture()}
            <div class="actions">${!this.readonly?html`<button @click=${this.useQuick} ?disabled=${this.busy}>${this.text('configure_quick')}</button>`:nothing}<button @click=${()=>this.showAdvanced=!this.showAdvanced} ?disabled=${this.busy}>${this.text('other_actions')}</button></div>
            ${this.showAdvanced?html`<ha-automation-action .hass=${this.hass} .actions=${action.sequence} .disabled=${this.busy||this.readonly} .narrow=${this.narrow} @value-changed=${this.advancedChanged}></ha-automation-action>`:nothing}
            <label>${this.text('mode')}<select aria-label=${this.text('mode')} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>{action.mode=(e.target as HTMLSelectElement).value;if(quick)this.quick.set(this.selected,{...quick,mode:action.mode as ScriptMode});this.changed();}}>${['single','restart','queued','parallel'].map(mode=>html`<option .selected=${mode===action.mode}>${mode}</option>`)}</select></label>
            ${blueprint.buttons[this.indices[0]].actions[this.indices[1]].release_index!=null?html`<label class="check"><input type="checkbox" .checked=${!!action.loop} ?disabled=${this.busy||this.readonly} @change=${(e:Event)=>{action.loop=(e.target as HTMLInputElement).checked;if(quick)this.quick.set(this.selected,{...quick,loop:action.loop});this.changed();}}>${this.text('loop')}</label>${action.loop?html`<label>${this.text('loop_interval')}<input type="number" min="50" max="5000" step="1" .value=${String(action.loop_interval??250)} ?disabled=${this.busy||this.readonly} @input=${(e:Event)=>{action.loop_interval=(e.target as HTMLInputElement).valueAsNumber;if(quick)this.quick.set(this.selected,{...quick,loop_interval:action.loop_interval});this.changed();}}></label>`:nothing}`:nothing}
          </div>`:nothing}`}
        ${this.selectorSection()}
        ${!this.readonly?html`<details><summary>${this.text('setup')}</summary><div class="stack setup"><label>${this.text('name')}<input .value=${this.draft.name} maxlength="255" required ?disabled=${this.busy} @input=${(e:Event)=>{this.draft!.name=(e.target as HTMLInputElement).value;this.changed();}}></label><label>${this.text('identifier')}<input .value=${this.draft.identifier} maxlength="1024" required ?disabled=${this.busy} @input=${(e:Event)=>{this.draft!.identifier=(e.target as HTMLInputElement).value;this.changed();}}></label><label class="check"><input type="checkbox" .checked=${!!this.binding?.verified} ?disabled=${this.busy} @change=${(e:Event)=>{this.binding={...this.binding!,verified:(e.target as HTMLInputElement).checked};this.changed();}}>${this.text('confirm_binding')}</label><p class="status">${this.text(this.draft.enabled?'enabled':'disabled')}</p><label class="check"><input type="checkbox" .checked=${this.conflictChecked} ?disabled=${this.busy||this.dirty} @change=${(e:Event)=>this.conflictChecked=(e.target as HTMLInputElement).checked}>${this.text('conflict_check')}</label><button ?disabled=${this.busy||this.dirty||!this.envelope||(!this.draft.enabled&&!this.conflictChecked)} @click=${this.toggle}>${this.text(this.draft.enabled?'disable':'enable')}</button></div></details>
        <footer class="row"><button class="primary" ?disabled=${this.busy||!this.dirty||!blueprint} @click=${()=>this.save()}>${this.text('save')}</button><button ?disabled=${this.busy||!this.dirty} @click=${this.discard}>${this.text('cancel')}</button><span role="status">${this.text(this.busy?'saving':this.saved?'saved':this.dirty?'dirty':this.draft.enabled?'enabled':'disabled')}</span></footer>`:nothing}
      `:nothing}
      ${this.replacePending?html`<div class="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-label=${this.text('replace')}><p>${this.text('replace_advanced')}</p><div class="actions"><button @click=${this.replaceWithQuick}>${this.text('replace')}</button><button @click=${()=>this.replacePending=false}>${this.text('cancel')}</button></div></div></div>`:nothing}
    </section>`;
  }
  static styles=[controls,css`
    section{padding:28px}.device-heading{display:flex;align-items:center;gap:20px;min-width:0}.device-heading>div{min-width:0}h2{overflow-wrap:anywhere;line-height:1.4}.gesture-tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--divider-color);padding:0 0 20px}.gesture-tabs button{font-size:13px;text-align:left}.gesture-tabs [aria-pressed=true]{color:var(--primary-color);border-color:var(--primary-color);font-weight:600}.gesture-editor{padding-block:4px 16px}footer{border-top:1px solid var(--divider-color);padding-top:20px}details{border-top:1px solid var(--divider-color);padding-top:20px}summary{cursor:pointer;min-height:44px;padding:10px 0}.setup{padding-top:12px}ha-automation-action{min-width:0}@media(max-width:600px){section{padding:20px 16px}.device-heading{align-items:flex-start;gap:12px}.device-heading h2{font-size:20px}farhome-thumbnail[large]{width:64px;height:64px}}
  `];
}
