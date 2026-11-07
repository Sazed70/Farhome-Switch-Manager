import {LitElement,html,css,nothing} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import type {FarhomeHass,SelectorSnapshot} from './types.js';
import {FarhomeApi} from './api.js';
import {t,TextKey,errorKey} from './i18n.js';
import {controls} from './styles.js';

@customElement('farhome-selector-editor')
export class FarhomeSelectorEditor extends LitElement{
  @property({attribute:false}) hass!:FarhomeHass;
  @property() entityId='';
  @property() configId='';
  @property({type:Boolean}) allowed=false;
  @state() private snapshot?:SelectorSnapshot;
  @state() private options:string[]=[];
  @state() private active:string|null=null;
  @state() private initial:string|null=null;
  @state() private adding='';
  @state() private ack=false;
  @state() private dirty=false;
  @state() private busy=false;
  @state() private loading=false;
  @state() private error?:TextKey;
  @state() private applied=false;
  private token=0;
  private text=(key:TextKey)=>t(this.hass?.language,key);
  private get editable(){return !!this.snapshot?.editable&&this.allowed;}
  private get api(){return new FarhomeApi(this.hass);}
  private name(id:string){return String(this.hass.states[id]?.attributes.friendly_name||id);}
  get hasDirty(){return this.dirty;}
  get saving(){return this.busy;}
  protected updated(changed:Map<string,unknown>){if(changed.has('entityId')||changed.has('configId'))this.reload();}
  private emitDirty(value:boolean){this.dirty=value;this.applied=false;this.dispatchEvent(new CustomEvent('helper-dirty-changed',{detail:{dirty:value,busy:this.busy},bubbles:true,composed:true}));}
  private adopt(value:SelectorSnapshot){this.snapshot=value;this.options=[...value.options];this.active=null;this.initial=null;this.ack=false;this.adding='';this.emitDirty(false);}
  discard(){if(this.snapshot)this.adopt(this.snapshot);}
  async reload(){if(!this.entityId||!this.configId)return;const token=++this.token;this.loading=true;this.error=undefined;try{const value=await this.api.getSelector(this.entityId,this.configId);if(token===this.token)this.adopt(value);}catch(err){if(token===this.token)this.error=errorKey(err,'load_error');}finally{if(token===this.token)this.loading=false;}}
  private validDraft(){const value=this.snapshot;if(!value)return false;const initial=this.initial??value.initial;return this.options.length>0&&new Set(this.options).size===this.options.length&&this.options.every(id=>/^light\.[a-z0-9_]+$/.test(id)&&!!this.hass.states[id])&&this.options.includes(this.active??value.active)&&(initial===null||this.options.includes(initial));}
  private move(index:number,delta:number){const options=[...this.options];[options[index],options[index+delta]]=[options[index+delta],options[index]];this.options=options;this.emitDirty(true);this.updateComplete.then(()=>this.renderRoot.querySelector<HTMLButtonElement>(`[data-option="${options[index+delta]}"] [data-direction="${delta}"]`)?.focus());}
  private async apply(){if(!this.editable||!this.snapshot||!this.validDraft()||this.busy||(!this.ack&&this.snapshot.known_references.length>1))return;this.busy=true;this.error=undefined;this.emitDirty(true);try{const value=await this.api.updateSelector(this.snapshot,this.configId,this.options,this.active,this.initial,this.ack);this.adopt(value);this.applied=true;}catch(err){this.error=errorKey(err,'save_error');}finally{this.busy=false;this.dispatchEvent(new CustomEvent('helper-dirty-changed',{detail:{dirty:this.dirty,busy:false},bubbles:true,composed:true}));}}
  render(){
    const value=this.snapshot;
    const helper=this.hass.states[this.entityId];
    const active=helper?.state;
    const target=active?this.hass.states[active]:undefined;
    const options=helper?.attributes.options;
    const available=!!target&&target.state!=='unavailable'&&target.state!=='unknown'&&Array.isArray(options)&&options.includes(active);
    return html`<div class="stack">
    ${this.loading?html`<p role="status">${this.text('loading')}</p>`:nothing}
    ${this.error?html`<p class="notice" role="alert">${this.text(this.error)}</p>`:nothing}
    ${value?html`
      <div><h3>${this.text('active_light')}</h3><p>${available?this.name(active!):this.text('active_missing')} <small>${active}</small></p></div>
      ${!this.editable?html`<p class="notice">${this.text(value.origin==='yaml_or_unknown'?'yaml_readonly':'controller_readonly')}</p>`:nothing}
      <h3>${this.text('ordered_lights')}</h3><ol>${this.options.map((id,index)=>html`<li data-option=${id}><div class="light-name"><span>${this.name(id)}</span><small>${id}${!this.hass.states[id]||this.hass.states[id].state==='unavailable'?' · '+this.text('unavailable'):''}</small></div>${this.editable?html`<div class="list-actions"><button data-direction="-1" aria-label=${this.text('up')+' '+this.name(id)} ?disabled=${this.busy||index===0} @click=${()=>this.move(index,-1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 14 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><button data-direction="1" aria-label=${this.text('down')+' '+this.name(id)} ?disabled=${this.busy||index===this.options.length-1} @click=${()=>this.move(index,1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 10 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><button aria-label=${this.text('remove')+' '+this.name(id)} ?disabled=${this.busy} @click=${()=>{this.options=this.options.filter(item=>item!==id);this.emitDirty(true);}}>${this.text('remove')}</button></div>`:nothing}</li>`)}</ol>
      ${this.editable?html`
        <div class="fields"><label>${this.text('light_to_add')}<select aria-label=${this.text('light_to_add')} ?disabled=${this.busy} @change=${(e:Event)=>this.adding=(e.target as HTMLSelectElement).value}><option value="" .selected=${!this.adding}>${this.text('choose')}</option>${Object.keys(this.hass.states).filter(id=>/^light\.[a-z0-9_]+$/.test(id)&&!this.options.includes(id)).sort((a,b)=>this.name(a).localeCompare(this.name(b),this.hass.language)).map(id=>html`<option value=${id} .selected=${this.adding===id}>${this.name(id)}</option>`)}</select></label><button ?disabled=${this.busy||!this.adding||this.options.includes(this.adding)} @click=${()=>{if(this.adding&&!this.options.includes(this.adding)){this.options=[...this.options,this.adding];this.adding='';this.emitDirty(true);}}}>${this.text('add_light')}</button></div>
        <div class="fields">${(['active','initial'] as const).map(key=>{const selected=(key==='active'?this.active:this.initial)??value[key];return html`<label>${this.text(key==='active'?'active_light':'initial_light')}<select aria-label=${this.text(key==='active'?'active_light':'initial_light')} ?disabled=${this.busy} @change=${(e:Event)=>{const option=(e.target as HTMLSelectElement).value;if(key==='active')this.active=option||null;else this.initial=option||null;this.emitDirty(true);}}><option value="" .selected=${selected===null||!this.options.includes(selected)}>${this.text(key==='initial'&&selected===null?'no_initial':'choose')}</option>${this.options.map(id=>html`<option value=${id} .selected=${selected===id}>${this.name(id)}</option>`)}</select></label>`;})}</div>
        ${!this.validDraft()?html`<p class="notice">${this.text('list_invalid')}</p>`:nothing}
      `:nothing}
      <details><summary>${this.text('known_dependencies')} · ${value.known_references.length}</summary><p class="muted">${this.text('dependencies_notice')}</p><ul>${value.known_references.map(ref=>html`<li>${this.text(ref.type==='automation'?'reference_automation':'reference_config')} · ${ref.id}</li>`)}</ul></details>
      ${this.editable&&value.known_references.length>1?html`<label class="check"><input type="checkbox" .checked=${this.ack} ?disabled=${this.busy} @change=${(e:Event)=>this.ack=(e.target as HTMLInputElement).checked}>${this.text('dependencies_ack')}</label>`:nothing}
    `:nothing}
    <div class="actions">${this.editable?html`<button ?disabled=${this.busy||!this.dirty||!this.validDraft()||(!this.ack&&value!.known_references.length>1)} @click=${this.apply}>${this.text('apply_list')}</button><button ?disabled=${this.busy||!this.dirty} @click=${this.discard}>${this.text('cancel')}</button>`:nothing}<button ?disabled=${this.busy||this.loading} @click=${this.reload}>${this.text('reload_list')}</button></div>
    <span role="status">${this.applied?this.text('list_applied'):this.dirty?this.text('dirty'):''}</span>
  </div>`;}
  static styles=[controls,css`
    ol{margin:0;padding:0;list-style-position:inside}ol li{display:flex;align-items:center;gap:12px;border-top:1px solid var(--divider-color);padding:12px 0}.light-name{display:grid;gap:4px;min-width:0;flex:1;overflow-wrap:anywhere}.list-actions{display:flex;gap:6px}.list-actions button{padding:8px 10px;font-size:13px}.fields{align-items:end}details{font-size:13px}summary{cursor:pointer;min-height:44px;padding:10px 0}ul{padding-left:20px;overflow-wrap:anywhere}@media(max-width:500px){ol li{flex-wrap:wrap}.light-name{flex-basis:100%}.list-actions{margin-left:auto}}
  `];
}
