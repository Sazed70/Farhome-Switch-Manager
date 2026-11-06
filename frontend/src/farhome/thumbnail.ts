import {LitElement,html,css} from 'lit';
import {customElement,property,state} from 'lit/decorators.js';
import type {ImageAsset} from './types.js';
@customElement('farhome-thumbnail')
export class FarhomeThumbnail extends LitElement{
  @property({attribute:false}) asset:ImageAsset|null=null;
  @property({type:Boolean,reflect:true}) large=false;
  @state() private failed=false;
  protected willUpdate(changed:Map<string,unknown>){if(changed.has('asset'))this.failed=false;}
  render(){const url=this.asset?.url;const safe=url&&(/^https:\/\//.test(url)||/^\/assets\/switch_manager\//.test(url));return safe&&!this.failed?html`<img src=${url} alt="" loading="lazy" referrerpolicy="no-referrer" @error=${()=>this.failed=true}>`:html`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="6" width="30" height="36" rx="6"/><circle cx="24" cy="24" r="8"/><path d="M24 19v10"/></svg>`;}
  static styles=css`:host{display:grid;place-items:center;width:56px;height:56px;flex:none}:host([large]){width:80px;height:80px}img{width:100%;height:100%;object-fit:contain}svg{width:42px;height:42px;fill:none;stroke:var(--secondary-text-color);stroke-width:2}`;
}
