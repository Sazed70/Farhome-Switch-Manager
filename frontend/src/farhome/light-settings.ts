import {LitElement,css,html,nothing} from 'lit';
import {customElement,property} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {isRgbColor,lightTemperatureRange,supportsBrightness,supportsColor,supportsColorTemperature} from './actions.js';
import {t,uiLanguage,type TextKey} from './i18n.js';
import {controls} from './styles.js';
import type {EntityState,QuickAction,RgbColor} from './types.js';

type Tone = 'white'|'color'|'default';
const palette: ReadonlyArray<[TextKey,RgbColor]> = [
  ['light_blue',[105,184,255]], ['light_lavender',[168,139,255]],
  ['light_pink',[255,146,159]], ['light_amber',[255,189,101]],
];
const hex = (rgb:RgbColor) => '#' + rgb.map(channel=>channel.toString(16).padStart(2,'0')).join('');
const clamp = (value:number,min:number,max:number) => Math.min(max,Math.max(min,value));
const colorChannel = (hexColor:string,offset:number) => Number.parseInt(hexColor.slice(offset,offset+2),16);

function whiteTone(kelvin:number): string {
  const warm = clamp((kelvin-2000)/1400,0,1);
  if(kelvin<=3400)return `color-mix(in srgb, #ffb679, #ffe1bf ${warm*100}%)`;
  const cool = clamp((kelvin-3400)/3200,0,1);
  return `color-mix(in srgb, #ffe1bf, #d6e6ff ${cool*100}%)`;
}

@customElement('farhome-light-settings')
export class FarhomeLightSettings extends LitElement {
  @property({attribute:false}) value!: QuickAction;
  @property({attribute:false}) entity!: EntityState;
  @property() language?: string;
  @property({type:Boolean}) disabled=false;
  private lastBrightness?: number;
  private lastKelvin?: number;
  private lastColor?: RgbColor;

  protected willUpdate(changed:Map<string,unknown>){
    const previous=changed.get('entity') as EntityState|undefined;
    if(changed.has('entity')&&previous?.entity_id!==this.entity?.entity_id){
      this.lastBrightness=undefined;this.lastKelvin=undefined;this.lastColor=undefined;
    }
  }

  private text(key:TextKey){return t(this.language,key);}

  private get previewBrightness(): number {
    const current = this.entity.attributes.brightness;
    return typeof current==='number'&&Number.isFinite(current)?Math.round(clamp(current,0,255)*100/255):65;
  }

  private get preferredColor(): RgbColor {
    const current = this.entity.attributes.rgb_color;
    return this.lastColor??(isRgbColor(current)?current:palette[0][1]);
  }

  private updateAction(next:QuickAction){
    if(!this.disabled)this.dispatchEvent(new CustomEvent('light-settings-change',{detail:next}));
  }

  private useDefaultBrightness(useDefault:boolean){
    const next={...this.value};
    if(useDefault){
      this.lastBrightness=next.brightness_pct;
      delete next.brightness_pct;
    }else next.brightness_pct=this.lastBrightness??this.previewBrightness;
    this.updateAction(next);
  }

  private setTone(tone?:number|RgbColor){
    const next={...this.value};
    if(next.color_temp_kelvin!==undefined)this.lastKelvin=next.color_temp_kelvin;
    if(next.rgb_color)this.lastColor=next.rgb_color;
    delete next.color_temp_kelvin;
    delete next.rgb_color;
    if(typeof tone==='number')next.color_temp_kelvin=tone;
    else if(tone)next.rgb_color=tone;
    this.updateAction(next);
  }

  render(){
    if(!this.value||!this.entity)return nothing;
    const hasBrightness=supportsBrightness(this.entity);
    const hasWhite=supportsColorTemperature(this.entity);
    const hasColor=supportsColor(this.entity);
    if(!hasBrightness&&!hasWhite&&!hasColor)return nothing;

    const {brightness_pct,color_temp_kelvin,rgb_color}=this.value;
    const [minKelvin,maxKelvin]=lightTemperatureRange(this.entity);
    const currentKelvin=this.entity.attributes.color_temp_kelvin;
    const fallbackKelvin=typeof currentKelvin==='number'&&Number.isFinite(currentKelvin)?currentKelvin:3400;
    const kelvin=color_temp_kelvin??clamp(this.lastKelvin??fallbackKelvin,minKelvin,maxKelvin);
    const brightness=brightness_pct??this.previewBrightness;
    const selectedColor=hex(rgb_color??this.preferredColor);
    const tone:Tone=rgb_color?'color':color_temp_kelvin!==undefined?'white':'default';
    const brightnessText=brightness_pct===undefined?this.text('light_default'):new Intl.NumberFormat(uiLanguage(this.language),{maximumFractionDigits:6}).format(brightness_pct)+'%';
    const toneText=tone==='white'?`${kelvin} K`:tone==='color'?selectedColor.toUpperCase():this.text('light_default_tone');
    const preview=styleMap({
      '--lamp-color':tone==='color'?selectedColor:whiteTone(tone==='white'?kelvin:fallbackKelvin),
      '--lamp-level':String(brightness/100),
    });
    return html`
      <div class="light-settings">
        <div class="parameters">
          ${hasBrightness?html`
            <div class="setting">
              <div class="setting-label"><label for="brightness">${this.text('brightness')}</label><span>${brightnessText}</span></div>
              <input type="range" id="brightness" min="0" max="100" step=${Number.isInteger(brightness)?'1':'any'} .value=${String(brightness)}
                style=${styleMap({'--filled':`${brightness}%`})}
                ?disabled=${this.disabled||brightness_pct===undefined}
                @input=${(event:Event)=>this.updateAction({...this.value,brightness_pct:(event.target as HTMLInputElement).valueAsNumber})}>
              <label class="check"><input type="checkbox" .checked=${brightness_pct===undefined} ?disabled=${this.disabled}
                @change=${(event:Event)=>this.useDefaultBrightness((event.target as HTMLInputElement).checked)}>${this.text('light_use_default')}</label>
            </div>`:nothing}
          ${hasWhite||hasColor?html`
            <div class="setting tone-setting">
              <h3>${this.text('light_tone')}</h3>
              <div class="tone-options" role="group" aria-label=${this.text('light_tone')}>
                ${hasWhite?html`<button type="button" aria-pressed=${tone==='white'} ?disabled=${this.disabled} @click=${()=>{if(tone!=='white')this.setTone(kelvin);}}>${this.text('light_white')}</button>`:nothing}
                ${hasColor?html`<button type="button" aria-pressed=${tone==='color'} ?disabled=${this.disabled} @click=${()=>{if(tone!=='color')this.setTone(this.preferredColor);}}>${this.text('light_color')}</button>`:nothing}
                <button type="button" aria-pressed=${tone==='default'} ?disabled=${this.disabled} @click=${()=>{if(tone!=='default')this.setTone();}}>${this.text('light_default')}</button>
              </div>
              ${tone==='white'&&hasWhite?html`
                <div class="setting-label tone-value"><label for="kelvin">${this.text('kelvin')}</label><span>${kelvin} K</span></div>
                <input type="range" id="kelvin" min=${minKelvin} max=${maxKelvin} step=${Number.isInteger(kelvin)?'1':'any'}
                  .value=${String(kelvin)} ?disabled=${this.disabled}
                  @input=${(event:Event)=>this.setTone((event.target as HTMLInputElement).valueAsNumber)}>
                <div class="range-ends" aria-hidden="true"><span>${this.text('light_warm')}</span><span>${this.text('light_cool')}</span></div>`:nothing}
              ${tone==='color'&&hasColor?html`
                <div class="setting-label tone-value"><label for="rgb">${this.text('light_custom_color')}</label><span>${selectedColor.toUpperCase()}</span></div>
                <div class="palette" role="group" aria-label=${this.text('light_palette')}>
                  ${palette.map(([label,rgb])=>html`<button type="button" aria-label=${this.text(label)} aria-pressed=${selectedColor===hex(rgb)}
                    style=${styleMap({'--swatch':hex(rgb)})} ?disabled=${this.disabled} @click=${()=>this.setTone(rgb)}></button>`)}
                  <input type="color" id="rgb" .value=${selectedColor} ?disabled=${this.disabled}
                    @input=${(event:Event)=>{
                      const color=(event.target as HTMLInputElement).value;
                      this.setTone([colorChannel(color,1),colorChannel(color,3),colorChannel(color,5)]);
                    }}>
                </div>`:nothing}
            </div>`:nothing}
        </div>
        <figure class="light-preview">
          <div class="light-stage" style=${preview} aria-hidden="true">
            <div class="light-pool"></div><div class="lamp-stem"></div><div class="lamp-body"></div><div class="lamp-lens"></div>
          </div>
          <figcaption><span>${this.text('light_preview')}</span><strong aria-live="polite">${hasBrightness?`${brightnessText} · ${toneText}`:toneText}</strong></figcaption>
        </figure>
      </div>`;
  }

  static styles=[controls,css`
    :host{container-type:inline-size}
    .light-settings{display:grid;grid-template-columns:minmax(0,1.23fr) minmax(0,1fr);gap:18px}
    .parameters{display:grid;align-content:start;gap:14px;min-width:0}
    .setting-label,.range-ends{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
    .setting-label span,figcaption strong{font-variant-numeric:tabular-nums;font-weight:600}
    .setting-label label{font-weight:600}
    .tone-value{margin-top:12px}
    .tone-value label{font-weight:400}
    .range-ends,.check,figcaption{color:var(--secondary-text-color)}
    .range-ends{font-size:12px}
    .setting+.setting{padding-top:14px;border-top:1px solid var(--divider-color)}
    input[type=range]{appearance:none;display:block;margin:0;padding:0;border:0;min-height:44px;background:transparent;accent-color:var(--primary-color)}
    input[type=range]::-webkit-slider-runnable-track{height:7px;border-radius:4px;background:var(--divider-color)}
    #brightness::-webkit-slider-runnable-track{background:linear-gradient(to right,var(--primary-color) var(--filled),var(--divider-color) var(--filled))}
    input[type=range]::-moz-range-track{height:7px;border-radius:4px;background:var(--divider-color)}
    input[type=range]::-moz-range-progress{height:7px;border-radius:4px;background:var(--primary-color)}
    input[type=range]::-webkit-slider-thumb{appearance:none;width:18px;height:18px;margin-top:-5.5px;border:2px solid var(--card-background-color);border-radius:50%;background:var(--primary-color);box-shadow:0 0 0 1px var(--primary-color)}
    input[type=range]::-moz-range-thumb{width:15px;height:15px;border:2px solid var(--card-background-color);border-radius:50%;background:var(--primary-color)}
    input[type=range]:disabled{opacity:.5}
    #kelvin::-webkit-slider-runnable-track{background:linear-gradient(90deg,#e89a57,#efd2aa 40%,#dceaff 77%,#a2c9f7)}
    #kelvin::-moz-range-track{background:linear-gradient(90deg,#e89a57,#efd2aa 40%,#dceaff 77%,#a2c9f7)}
    .tone-options,.palette{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}
    .tone-options button{flex:1 0 auto;padding:8px 11px}
    button[aria-pressed=true]{border-color:var(--primary-color);font-weight:600}
    .palette button,.palette input{width:44px;height:44px;padding:5px}
    .palette button::before{content:"";display:block;height:100%;background:var(--swatch);border-radius:4px}
    .palette button[aria-pressed=true]{box-shadow:inset 0 0 0 1px var(--primary-color)}
    .light-preview{margin:0;min-width:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--divider-color);border-radius:10px}
    .light-stage{position:relative;min-height:128px;flex:1;display:grid;place-items:center;isolation:isolate;overflow:hidden;background:#292b2e}
    .light-pool{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 60%,var(--lamp-color),color-mix(in srgb,var(--lamp-color),transparent 42%) 32%,transparent 72%);opacity:var(--lamp-level)}
    .lamp-stem{position:absolute;top:0;height:38%;width:3px;background:#17191b}
    .lamp-body{position:absolute;top:35%;width:84px;height:33px;border-radius:50% 50% 23% 23% / 86% 86% 20% 20%;background:#17191b}
    .lamp-lens{position:absolute;top:calc(35% + 26px);width:63px;height:9px;border-radius:50%;background:color-mix(in srgb,var(--lamp-color) calc(100% * var(--lamp-level)),#424446)}
    figcaption{display:grid;gap:2px;padding:10px 12px;font-size:12px}
    figcaption strong{color:var(--primary-text-color);font-size:14px}
    @container(max-width:500px){.light-settings{grid-template-columns:minmax(0,1fr);gap:14px}.light-preview{grid-row:1}.light-stage{min-height:100px}}
  `];
}
