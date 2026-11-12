import {LitElement,html,css,nothing} from 'lit';
import {customElement,property,state,query} from 'lit/decorators.js';
import type {Route} from '../types.js';
import type {FarhomeHass,Snapshot,Controller,MetadataPatch} from './types.js';
import {FarhomeApi} from './api.js';
import {t,TextKey,errorKey,warningKey,uiLanguage} from './i18n.js';
import {controls} from './styles.js';
import {syncModalDialog} from './dialog.js';
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
  @state() private error?:TextKey;
  @state() private path='';
  @state() private pending='';
  @state() private dirty=false;
  @state() private add=false;
  @state() private adding='';
  @state() private mutation=false;
  @query('farhome-device-editor') private editor?:FarhomeDeviceEditor;
  @query('dialog.leave-dialog') private leaveDialog?:HTMLDialogElement;
  private associations=new Map<string,string>();
  private text=(key:TextKey)=>t(this.hass?.language,key);
  private beforeUnload=(event:BeforeUnloadEvent)=>{if(this.dirty){event.preventDefault();event.returnValue='';}};
  connectedCallback(){super.connectedCallback();window.addEventListener('beforeunload',this.beforeUnload);}
  disconnectedCallback(){super.disconnectedCallback();window.removeEventListener('beforeunload',this.beforeUnload);}
  protected firstUpdated(){this.path=this.route?.path||'';this.refresh();}
  protected updated(changed:Map<string,unknown>){
    if(changed.has('route')&&this.snapshot&&this.route?.path!==this.path)this.navigate(this.route?.path||'',true);
    if(changed.has('pending'))syncModalDialog(this.leaveDialog,!!this.pending);
  }
  allowRoute(path:string){if(this.dirty||this.editor?.saving){this.pending=path;return false;}return true;}
  private get api(){return new FarhomeApi(this.hass);}
  private get parts(){return this.path.split('/').filter(Boolean).map(part=>{try{return decodeURIComponent(part);}catch{return part;}});}
  private get area(){return this.parts[1]||this.snapshot?.areas[0]?.id||NONE;}
  private get deviceId(){return this.parts[2]==='device'?this.parts[3]:undefined;}
  private roomPath(area:string){return `/rooms/${encodeURIComponent(area)}`;}
  async refresh(){this.loading=true;this.error=undefined;try{this.snapshot=await this.api.snapshot();}catch(err){this.error=errorKey(err,'load_error');}finally{this.loading=false;}}
  private commitPath(path:string,external=false){this.path=path;this.pending='';this.dirty=false;if(!external){history.pushState(null,'','/switch_manager'+path);window.dispatchEvent(new CustomEvent('location-changed'));}}
  private navigate(path:string,external=false){if(path===this.path)return;if(this.dirty||this.editor?.saving){this.pending=path;return;}if(path==='/legacy'){history.pushState(null,'','/switch_manager/legacy');window.dispatchEvent(new CustomEvent('location-changed'));return;}this.commitPath(path,external);}
  private stay(){this.pending='';history.replaceState(null,'','/switch_manager'+this.path);window.dispatchEvent(new CustomEvent('location-changed'));}
  private leave(){this.editor?.discard();const path=this.pending;this.commitPath(path);}
  private async saveLeave(){if(await this.editor?.save(true)){const path=this.pending;this.commitPath(path);}}
  private async metadata(patch:MetadataPatch){if(!this.snapshot||this.mutation)return;this.mutation=true;this.error=undefined;try{await this.api.saveMetadata(patch,this.snapshot.metadata_revision);await this.refresh();this.add=false;this.adding='';}catch(err){this.error=errorKey(err,'save_error');}finally{this.mutation=false;}}
  private group(controllers:Controller[]){
    const ordered=[...controllers].sort((a,b)=>a.manufacturer.localeCompare(b.manufacturer,this.hass.language)||a.model.localeCompare(b.model,this.hass.language)||a.name.localeCompare(b.name,this.hass.language));
    const groups=new Map<string,Controller[]>();for(const item of ordered){const key=[item.manufacturer,item.model].filter(Boolean).join(' · ')||this.text('unknown');groups.set(key,[...(groups.get(key)||[]),item]);}return Array.from(groups);
  }
  private deviceRow(controller:Controller){
    const mgmt=this.text(controller.management==='farhome'?'managed':controller.management==='external'?'external':'unknown');
    const verified=this.text(controller.compatibility==='verified'?'verified':'unverified');
    const countLabel=`${controller.config_ids.length} ${this.text(controller.config_ids.length===1?'config_count_one':'config_count_many')}`;
    return html`<button class="device" data-device=${controller.device_id} aria-pressed=${controller.device_id===this.deviceId} @click=${()=>this.navigate(`${this.roomPath(this.area)}/device/${encodeURIComponent(controller.device_id)}`)}>
      <farhome-thumbnail .asset=${controller.image}></farhome-thumbnail>
      <span class="device-copy">
        <span class="device-title-row"><strong>${controller.name}</strong><span class="device-dot ${controller.config_ids.length?'configured':''}" aria-hidden="true"></span></span>
        <small>${verified} · ${countLabel}</small>
        <span class="device-chip">${mgmt}</span>
      </span>
    </button>`;
  }
  render(){
    const snapshot=this.snapshot;
    const selected=snapshot?.controllers.find(item=>item.device_id===this.deviceId);
    const controllers=snapshot?.controllers.filter(item=>(item.area_id||NONE)===this.area)||[];
    const roomName=this.area===NONE?this.text('no_room'):this.area===UNASSOCIATED?this.text('unassociated'):snapshot?.areas.find(item=>item.id===this.area)?.name||this.text('rooms');
    const rooms=[...(snapshot?.areas||[]),{id:NONE,name:this.text('no_room')},{id:UNASSOCIATED,name:this.text('unassociated')}];
    const roomCount=(id:string)=>id===UNASSOCIATED?snapshot?.unassociated_configs.length||0:snapshot?.controllers.filter(item=>(item.area_id||NONE)===id).length||0;
    return html`<main lang=${uiLanguage(this.hass?.language)} class=${selected?'has-device':''}>
      <header class="top"><ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button><div class="title-wrap"><h1>${this.text('title')}</h1></div><button class="ghost legacy" @click=${()=>this.navigate('/legacy')}>${this.text('legacy')}</button></header>
      ${this.error?html`<div class="notice global-error" role="alert">${this.text(this.error)} <button @click=${this.refresh}>${this.text('retry')}</button></div>`:nothing}
      ${!snapshot&&this.loading?html`<p class="placeholder" role="status">${this.text('loading')}</p>`:nothing}
      ${snapshot?html`<nav aria-label=${this.text('rooms')}>${rooms.map(room=>html`<button aria-label=${room.name} aria-current=${room.id===this.area?'page':nothing} @click=${()=>this.navigate(this.roomPath(room.id))}><span>${room.name}</span><span class="room-count" aria-hidden="true">${roomCount(room.id)}</span></button>`)}</nav>
        ${snapshot.warnings.length?html`<p class="warnings muted">${snapshot.warnings.map(code=>this.text(warningKey(code))).join(' · ')}</p>`:nothing}
        <div class="workspace"><section class="inventory" aria-label=${roomName}><div class="room-heading"><div><h2>${roomName}</h2><small class="muted">${roomCount(this.area)} ${this.area===UNASSOCIATED?this.text('config_count_many'):''}</small></div><button @click=${()=>this.add=!this.add}>${this.text('add_button')}</button></div>
          ${this.add?html`<form class="stack manual" @submit=${(e:Event)=>{e.preventDefault();if(this.adding)this.metadata({controllers:{[this.adding]:{...snapshot.metadata.controllers[this.adding],manual:true}}});}}><label>${this.text('registered_device')}<select required .value=${this.adding} @change=${(e:Event)=>this.adding=(e.target as HTMLSelectElement).value}><option value="">${this.text('choose')}</option>${snapshot.available_devices.map(device=>html`<option value=${device.id}>${device.name_by_user||device.name||device.id} · ${device.model||''}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation||!this.adding}>${this.text('add_to_list')}</button></form>`:nothing}
          ${this.area===UNASSOCIATED?html`${snapshot.unassociated_configs.length?snapshot.unassociated_configs.map(config=>html`<form class="stack unassociated" @submit=${(e:Event)=>{e.preventDefault();const device_id=this.associations.get(config.config_id);if(device_id)this.metadata({bindings:{[config.config_id]:{...snapshot.metadata.bindings[config.config_id],device_id,verified:false,conflicts_checked:false}}});}}><h3>${config.name}</h3><label>${this.text('associate_device')}<select required @change=${(e:Event)=>this.associations.set(config.config_id,(e.target as HTMLSelectElement).value)}><option value="">${this.text('choose')}</option>${snapshot.controllers.map(item=>html`<option value=${item.device_id}>${item.name}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation}>${this.text('link_config')}</button></form>`):html`<p class="placeholder">${this.text('no_unassociated')}</p>`}`:html`${this.group(controllers).map(([name,items])=>html`<section class="model-group"><h3>${name}</h3>${items.map(item=>this.deviceRow(item))}</section>`)}${!controllers.length?html`<p class="placeholder">${this.text('empty_room')}</p>`:nothing}`}
        </section><section class="detail">${selected?html`<button class="mobile-back" @click=${()=>this.navigate(this.roomPath(this.area))}>${this.text('back')} · ${roomName}</button><farhome-device-editor .hass=${this.hass} .controller=${selected} .route=${this.route} .narrow=${this.narrow} .areas=${snapshot.areas} @dirty-changed=${(e:CustomEvent)=>{this.dirty=e.detail.dirty;this.requestUpdate();}} @save=${()=>this.refresh()} @delete=${()=>this.refresh()}></farhome-device-editor>${selected.image&&/^https:\/\//.test(selected.image.source_url)?html`<p class="credit"><a href=${selected.image.source_url} target="_blank" rel="noopener noreferrer">${selected.image.source_label==='Zigbee2MQTT · personalizzata'?this.text('custom_zigbee2mqtt_image'):selected.image.source_label}</a></p>`:nothing}`:html`<p class="placeholder">${this.text('select_device')}</p>`}</section></div>
      `:nothing}
      <dialog class="leave-dialog" aria-label=${this.text('dirty')} @cancel=${(e:Event)=>{e.preventDefault();this.stay();}}>
        <h3>${this.text('dirty')}</h3>
        <p class="muted">${this.text('leave_question')}</p>
        ${this.editor?.hasHelperDirty?html`<p class="notice">${this.text('helper_draft_pending')}</p>`:nothing}
        <div class="actions">
          <button class="primary" ?disabled=${this.editor?.saving||this.editor?.hasHelperDirty} @click=${this.saveLeave}>${this.text('save_leave')}</button>
          <button ?disabled=${this.editor?.saving} @click=${this.leave}>${this.text('discard')}</button>
          <button autofocus @click=${this.stay}>${this.text('stay')}</button>
        </div>
      </dialog>
    </main>`;
  }
  static styles=[controls,css`
    :host{background:var(--fh-bg);min-height:100vh}
    main{max-width:1520px;margin:auto;padding-bottom:28px}
    .top{display:flex;align-items:center;gap:12px;padding:18px 28px 14px}
    .title-wrap{flex:1;min-width:0}
    .legacy{font-size:13px;min-height:36px;padding:6px 12px}
    .global-error{margin:0 28px 16px}
    nav{display:flex;gap:8px;overflow:auto;padding:0 28px 18px;scrollbar-color:var(--fh-border) transparent}
    nav button{
      display:inline-flex;align-items:center;gap:8px;white-space:nowrap;min-height:38px;padding:7px 14px;
      border-radius:var(--fh-radius-pill);background:var(--fh-surface);border-color:var(--fh-border);font-size:13px;
    }
    nav button:hover:not(:disabled){background:var(--fh-surface-subtle)}
    nav [aria-current=page]{background:var(--fh-accent);border-color:var(--fh-accent);color:var(--fh-accent-fg);font-weight:600}
    .room-count{padding:1px 7px;border-radius:var(--fh-radius-pill);font-size:12px;font-variant-numeric:tabular-nums;background:var(--fh-surface-subtle);color:var(--fh-muted)}
    nav [aria-current=page] .room-count{background:rgba(0,0,0,.18);color:var(--fh-accent-fg)}
    .workspace{display:grid;grid-template-columns:minmax(290px,350px) minmax(0,1fr);gap:20px;align-items:start;margin:0 28px}
    .inventory,.detail{min-width:0;background:var(--fh-surface);border:1px solid var(--fh-border);border-radius:16px}
    .inventory{padding:16px;display:grid;gap:14px}
    .detail{overflow:clip}
    .room-heading{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:4px 4px 2px}
    .room-heading button{font-size:13px;min-height:36px;padding:6px 12px}
    .model-group{display:grid;gap:8px}
    .model-group h3{padding:8px 4px 2px;font-size:12px;color:var(--fh-muted);font-weight:600;text-transform:uppercase;letter-spacing:.03em}
    .device{
      display:flex;width:100%;align-items:center;gap:12px;text-align:left;padding:12px;
      border-radius:12px;border:1px solid var(--fh-border);background:transparent;
    }
    .device:hover:not(:disabled){background:var(--fh-surface-subtle)}
    .device[aria-pressed=true]{background:var(--fh-surface-subtle);border-color:var(--fh-accent)}
    .device-copy{display:grid;gap:4px;min-width:0;flex:1}
    .device-title-row{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .device-copy strong{font-size:14px;font-weight:600;line-height:1.35;overflow-wrap:anywhere}
    .device-dot{width:8px;height:8px;border-radius:50%;background:var(--fh-border);flex:none}
    .device-dot.configured{background:var(--fh-success)}
    .device-chip{justify-self:start;font-size:12px;padding:2px 8px;border-radius:6px;background:var(--fh-bg);border:1px solid var(--fh-border);color:var(--fh-muted)}
    .placeholder{padding:28px;color:var(--fh-muted);line-height:1.6}
    .manual,.unassociated{padding:14px;border:1px solid var(--fh-border);border-radius:12px;background:var(--fh-surface-subtle)}
    .credit{padding:0 28px 24px;font-size:12px}
    .warnings{padding:0 28px 16px;font-size:13px}
    .mobile-back{display:none}
    @media(max-width:860px){
      .top{padding:14px 16px}
      .top h1{font-size:20px}
      nav{padding:0 16px 14px}
      .workspace{display:block;margin:0 12px}
      .detail{display:none}
      .has-device .inventory{display:none}
      .has-device .detail{display:block}
      .mobile-back{display:inline-flex;align-items:center;margin:16px 16px 0;min-height:36px;font-size:13px}
      .legacy{max-width:120px;line-height:1.25;padding:6px 10px}
      .global-error{margin:0 12px 14px}
      .warnings{padding-inline:16px}
      .credit{padding-inline:16px}
    }
    @media(prefers-reduced-motion:no-preference){.workspace{animation:appear .16s ease-out}@keyframes appear{from{opacity:.85}to{opacity:1}}}
  `];
}
