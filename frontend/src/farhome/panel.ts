import {LitElement,html,css,nothing} from 'lit';
import {customElement,property,state,query} from 'lit/decorators.js';
import type {Route} from '../types.js';
import type {FarhomeHass,Snapshot,Controller,MetadataPatch} from './types.js';
import {FarhomeApi} from './api.js';
import {t,TextKey} from './i18n.js';
import {controls} from './styles.js';
import {dialogKeys} from './dialog.js';
import {FarhomeDeviceEditor} from './device-editor.js';
import './device-editor.js';
import './thumbnail.js';

const NONE='_no_area',UNASSOCIATED='_unassociated';
@customElement('farhome-panel')
export class FarhomePanel extends LitElement{
  @property({attribute:false}) hass!:FarhomeHass;
  @property({attribute:false}) route?:Route;
  @property({type:Boolean}) narrow=false;
  @state() private snapshot?:Snapshot;
  @state() private loading=false;
  @state() private error='';
  @state() private path='';
  @state() private pending='';
  @state() private dirty=false;
  @state() private add=false;
  @state() private adding='';
  @state() private mutation=false;
  @query('farhome-device-editor') private editor?:FarhomeDeviceEditor;
  private associations=new Map<string,string>();
  private text=(key:TextKey)=>t(this.hass?.language,key);
  private beforeUnload=(event:BeforeUnloadEvent)=>{if(this.dirty){event.preventDefault();event.returnValue='';}};
  connectedCallback(){super.connectedCallback();window.addEventListener('beforeunload',this.beforeUnload);}
  disconnectedCallback(){super.disconnectedCallback();window.removeEventListener('beforeunload',this.beforeUnload);}
  protected firstUpdated(){this.path=this.route?.path||'';this.refresh();}
  protected updated(changed:Map<string,unknown>){if(changed.has('route')&&this.snapshot&&this.route?.path!==this.path)this.navigate(this.route?.path||'',true);if(changed.has('pending')&&this.pending)this.renderRoot.querySelector<HTMLButtonElement>('[role=dialog] button:last-child')?.focus();}
  allowRoute(path:string){if(this.dirty||this.editor?.saving){this.pending=path;return false;}return true;}
  private get api(){return new FarhomeApi(this.hass);}
  private get parts(){return this.path.split('/').filter(Boolean).map(part=>{try{return decodeURIComponent(part);}catch{return part;}});}
  private get area(){return this.parts[1]||this.snapshot?.areas[0]?.id||NONE;}
  private get deviceId(){return this.parts[2]==='device'?this.parts[3]:undefined;}
  private roomPath(area:string){return `/rooms/${encodeURIComponent(area)}`;}
  async refresh(){this.loading=true;this.error='';try{this.snapshot=await this.api.snapshot();}catch(err){this.error=(err as Error).message||this.text('load_error');}finally{this.loading=false;}}
  private commitPath(path:string,external=false){this.path=path;this.pending='';this.dirty=false;if(!external){history.pushState(null,'','/switch_manager'+path);window.dispatchEvent(new CustomEvent('location-changed'));}}
  private navigate(path:string,external=false){if(path===this.path)return;if(this.dirty||this.editor?.saving){this.pending=path;return;}if(path==='/legacy'){history.pushState(null,'','/switch_manager/legacy');window.dispatchEvent(new CustomEvent('location-changed'));return;}this.commitPath(path,external);}
  private stay(){this.pending='';history.replaceState(null,'','/switch_manager'+this.path);window.dispatchEvent(new CustomEvent('location-changed'));}
  private leave(){this.editor?.discard();const path=this.pending;this.commitPath(path);}
  private async saveLeave(){if(await this.editor?.save()){const path=this.pending;this.commitPath(path);}}
  private async metadata(patch:MetadataPatch){if(!this.snapshot||this.mutation)return;this.mutation=true;this.error='';try{await this.api.saveMetadata(patch,this.snapshot.metadata_revision);await this.refresh();this.add=false;this.adding='';}catch(err){this.error=(err as Error).message||this.text('load_error');}finally{this.mutation=false;}}
  private group(controllers:Controller[]){
    const ordered=[...controllers].sort((a,b)=>a.manufacturer.localeCompare(b.manufacturer,this.hass.language)||a.model.localeCompare(b.model,this.hass.language)||a.name.localeCompare(b.name,this.hass.language));
    const groups=new Map<string,Controller[]>();for(const item of ordered){const key=[item.manufacturer,item.model].filter(Boolean).join(' · ')||this.text('unknown');groups.set(key,[...(groups.get(key)||[]),item]);}return Array.from(groups);
  }
  private deviceRow(controller:Controller){return html`<button class="device" data-device=${controller.device_id} aria-pressed=${controller.device_id===this.deviceId} @click=${()=>this.navigate(`${this.roomPath(this.area)}/device/${encodeURIComponent(controller.device_id)}`)}><farhome-thumbnail .asset=${controller.image}></farhome-thumbnail><span class="device-copy"><strong>${controller.name}</strong><small>${this.text(controller.management==='farhome'?'managed':controller.management==='external'?'external':'unknown')}</small><small>${this.text(controller.compatibility==='verified'?'verified':'unverified')} · ${controller.config_ids.length} ${this.text('configuration').toLocaleLowerCase(this.hass.language)}</small></span></button>`;}
  render(){
    const snapshot=this.snapshot;
    const selected=snapshot?.controllers.find(item=>item.device_id===this.deviceId);
    const controllers=snapshot?.controllers.filter(item=>(item.area_id||NONE)===this.area)||[];
    const roomName=this.area===NONE?this.text('no_room'):this.area===UNASSOCIATED?this.text('unassociated'):snapshot?.areas.find(item=>item.id===this.area)?.name||this.text('rooms');
    const rooms=[...(snapshot?.areas||[]),{id:NONE,name:this.text('no_room')},{id:UNASSOCIATED,name:this.text('unassociated')}];
    return html`<main class=${selected?'has-device':''}>
      <header class="top"><ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button><h1>${this.text('title')}</h1><button class="legacy" @click=${()=>this.navigate('/legacy')}>${this.text('legacy')}</button></header>
      ${this.error?html`<div class="notice global-error" role="alert">${this.error} <button @click=${this.refresh}>${this.text('retry')}</button></div>`:nothing}
      ${!snapshot&&this.loading?html`<p class="placeholder" role="status">${this.text('loading')}</p>`:nothing}
      ${snapshot?html`<nav aria-label=${this.text('rooms')}>${rooms.map(room=>html`<button aria-current=${room.id===this.area?'page':nothing} @click=${()=>this.navigate(this.roomPath(room.id))}>${room.name}</button>`)}</nav>
        ${snapshot.warnings.length?html`<p class="warnings muted">${snapshot.warnings.join(' · ')}</p>`:nothing}
        <div class="workspace"><section class="inventory" aria-label=${roomName}><div class="room-heading"><h2>${roomName}</h2><button @click=${()=>this.add=!this.add}>${this.text('add_button')}</button></div>
          ${this.add?html`<form class="stack manual" @submit=${(e:Event)=>{e.preventDefault();if(this.adding)this.metadata({controllers:{[this.adding]:{...snapshot.metadata.controllers[this.adding],manual:true}}});}}><label>${this.text('registered_device')}<select required .value=${this.adding} @change=${(e:Event)=>this.adding=(e.target as HTMLSelectElement).value}><option value="">${this.text('choose')}</option>${snapshot.available_devices.map(device=>html`<option value=${device.id}>${device.name_by_user||device.name||device.id} · ${device.model||''}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation||!this.adding}>${this.text('add_to_list')}</button></form>`:nothing}
          ${this.area===UNASSOCIATED?html`${snapshot.unassociated_configs.length?snapshot.unassociated_configs.map(config=>html`<form class="stack unassociated" @submit=${(e:Event)=>{e.preventDefault();const device_id=this.associations.get(config.config_id);if(device_id)this.metadata({bindings:{[config.config_id]:{...snapshot.metadata.bindings[config.config_id],device_id,verified:false,conflicts_checked:false}}});}}><h3>${config.name}</h3><label>${this.text('associate_device')}<select required @change=${(e:Event)=>this.associations.set(config.config_id,(e.target as HTMLSelectElement).value)}><option value="">${this.text('choose')}</option>${snapshot.controllers.map(item=>html`<option value=${item.device_id}>${item.name}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation}>${this.text('link_config')}</button></form>`):html`<p class="placeholder">${this.text('no_unassociated')}</p>`}`:html`${this.group(controllers).map(([name,items])=>html`<section class="model-group"><h3>${name}</h3>${items.map(item=>this.deviceRow(item))}</section>`)}${!controllers.length?html`<p class="placeholder">${this.text('empty_room')}</p>`:nothing}`}
        </section><section class="detail">${selected?html`<button class="mobile-back" @click=${()=>this.navigate(this.roomPath(this.area))}>${this.text('back')} · ${roomName}</button><farhome-device-editor .hass=${this.hass} .controller=${selected} .route=${this.route} .narrow=${this.narrow} @dirty-changed=${(e:CustomEvent)=>this.dirty=e.detail.dirty} @save=${()=>this.refresh()}></farhome-device-editor>${selected.image&&/^https:\/\//.test(selected.image.source_url)?html`<p class="credit"><a href=${selected.image.source_url} target="_blank" rel="noopener noreferrer">${selected.image.source_label}</a></p>`:nothing}`:html`<p class="placeholder">${this.text('select_device')}</p>`}</section></div>
      `:nothing}
      ${this.pending?html`<div class="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-label=${this.text('dirty')} @keydown=${(e:KeyboardEvent)=>dialogKeys(e,()=>this.stay())}><p>${this.text('leave_question')}</p><div class="actions"><button class="primary" ?disabled=${this.editor?.saving} @click=${this.saveLeave}>${this.text('save_leave')}</button><button ?disabled=${this.editor?.saving} @click=${this.leave}>${this.text('discard')}</button><button @click=${this.stay}>${this.text('stay')}</button></div></div></div>`:nothing}
    </main>`;
  }
  static styles=[controls,css`
    :host{background:var(--primary-background-color);min-height:100vh}main{max-width:1600px;margin:auto}.top{display:flex;align-items:center;gap:12px;padding:20px 28px}.top h1{flex:1}.legacy{font-size:13px}.global-error{margin:0 28px 18px}nav{display:flex;gap:8px;overflow:auto;padding:0 28px 20px;scrollbar-color:var(--divider-color) transparent}nav button{white-space:nowrap;border-color:transparent}nav [aria-current=page]{background:var(--card-background-color);border-color:var(--primary-color);color:var(--primary-color);font-weight:600}.workspace{display:grid;grid-template-columns:minmax(300px,38%) minmax(0,1fr);margin:0 28px 28px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:12px;overflow:hidden}.inventory{min-width:0;border-right:1px solid var(--divider-color)}.room-heading{padding:24px;display:flex;gap:12px;align-items:center;justify-content:space-between}.room-heading h2{font-size:19px}.room-heading button{font-size:13px}.model-group h3{padding:20px 24px 10px;font-size:13px;color:var(--secondary-text-color);font-weight:500}.device{display:flex;width:100%;align-items:center;gap:14px;text-align:left;border:0;border-radius:0;padding:16px 24px;border-top:1px solid var(--divider-color)}.device[aria-pressed=true]{background:var(--primary-background-color)}.device-copy{display:grid;gap:4px;min-width:0}.device-copy strong{font-size:15px;line-height:1.45;overflow-wrap:anywhere}.device-copy small{font-size:12px}.detail{min-width:0}.placeholder{padding:28px;color:var(--secondary-text-color);line-height:1.6}.manual,.unassociated{padding:24px;border-bottom:1px solid var(--divider-color)}.credit{padding:0 28px 24px;font-size:12px}.warnings{padding:0 28px 20px;font-size:13px}.mobile-back{display:none}@media(max-width:800px){.top{padding:16px}.top h1{font-size:23px}nav{padding:0 16px 16px}.workspace{display:block;margin:0 12px 18px}.inventory{border:0}.detail{display:none}.has-device .inventory{display:none}.has-device .detail{display:block}.mobile-back{display:block;margin:16px 16px 0}.room-heading{padding:20px 16px}.model-group h3{padding-inline:16px}.device{padding-inline:16px}.legacy{max-width:110px;line-height:1.3;padding:8px}.global-error{margin:0 12px 16px}.warnings{padding-inline:16px}.credit{padding-inline:16px}}@media(prefers-reduced-motion:no-preference){.workspace{animation:appear .16s ease-out}@keyframes appear{from{opacity:.8}to{opacity:1}}}
  `];
}
