function t(t,e,i,s){var o,a=arguments.length,n=a<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var r=t.length-1;r>=0;r--)(o=t[r])&&(n=(a<3?o(n):a>3?o(e,i,n):o(e,i))||n);return a>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let a=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new a(i,t,s)},r=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,v=g.trustedTypes,m=v?v.emptyScript:"",b=g.reactiveElementPolyfillSupport,_=(t,e)=>t,f={toAttribute(t,e){switch(e){case Boolean:t=t?m:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const a=s?.call(this);o?.call(this,e),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(r(t))}else void 0!==t&&e.push(r(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:f;this._$Em=s;const a=o.fromAttribute(e,t.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const a=this.constructor;if(!1===s&&(o=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??y)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),!0!==o||void 0!==a)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[_("elementProperties")]=new Map,$[_("finalized")]=new Map,b?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,C=w.trustedTypes,A=C?C.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,L="?"+E,D=`<${L}>`,H=document,V=()=>H.createComment(""),M=t=>null===t||"object"!=typeof t&&"function"!=typeof t,z=Array.isArray,q="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,P=/>/g,B=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),I=/'/g,O=/"/g,R=/^(?:script|style|textarea|title)$/i,U=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),j=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),F=new WeakMap,Z=H.createTreeWalker(H,129);function K(t,e){if(!z(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const Q=(t,e)=>{const i=t.length-1,s=[];let o,a=2===e?"<svg>":3===e?"<math>":"",n=T;for(let e=0;e<i;e++){const i=t[e];let r,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===T?"!--"===l[1]?n=N:void 0!==l[1]?n=P:void 0!==l[2]?(R.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=B):void 0!==l[3]&&(n=B):n===B?">"===l[0]?(n=o??T,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,r=l[1],n=void 0===l[3]?B:'"'===l[3]?O:I):n===O||n===I?n=B:n===N||n===P?n=T:(n=B,o=void 0);const h=n===B&&t[e+1].startsWith("/>")?" ":"";a+=n===T?i+D:c>=0?(s.push(r),i.slice(0,c)+S+i.slice(c)+E+h):i+E+(-2===c?e:h)}return[K(t,a+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,a=0;const n=t.length-1,r=this.parts,[l,c]=Q(t,e);if(this.el=J.createElement(l,i),Z.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=Z.nextNode())&&r.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(S)){const e=c[a++],i=s.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);r.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?et:"?"===n[1]?it:"@"===n[1]?st:tt}),s.removeAttribute(t)}else t.startsWith(E)&&(r.push({type:6,index:o}),s.removeAttribute(t));if(R.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=C?C.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],V()),Z.nextNode(),r.push({type:2,index:++o});s.append(t[e],V())}}}else if(8===s.nodeType)if(s.data===L)r.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)r.push({type:7,index:o}),t+=E.length-1}o++}}static createElement(t,e){const i=H.createElement("template");return i.innerHTML=t,i}}function G(t,e,i=t,s){if(e===j)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const a=M(e)?void 0:e._$litDirective$;return o?.constructor!==a&&(o?._$AO?.(!1),void 0===a?o=void 0:(o=new a(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=G(t,o._$AS(t,e.values),o,s)),e}class Y{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??H).importNode(e,!0);Z.currentNode=s;let o=Z.nextNode(),a=0,n=0,r=i[0];for(;void 0!==r;){if(a===r.index){let e;2===r.type?e=new X(o,o.nextSibling,this,t):1===r.type?e=new r.ctor(o,r.name,r.strings,this,t):6===r.type&&(e=new ot(o,this,t)),this._$AV.push(e),r=i[++n]}a!==r?.index&&(o=Z.nextNode(),a++)}return Z.currentNode=H,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class X{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=G(this,t,e),M(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==j&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>z(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&M(this._$AH)?this._$AA.nextSibling.data=t:this.T(H.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(K(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new Y(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new J(t)),e}k(t){z(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new X(this.O(V()),this.O(V()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class tt{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,s){const o=this.strings;let a=!1;if(void 0===o)t=G(this,t,e,0),a=!M(t)||t!==this._$AH&&t!==j,a&&(this._$AH=t);else{const s=t;let n,r;for(t=o[0],n=0;n<o.length-1;n++)r=G(this,s[i+n],e,n),r===j&&(r=this._$AH[n]),a||=!M(r)||r!==this._$AH[n],r===W?t=W:t!==W&&(t+=(r??"")+o[n+1]),this._$AH[n]=r}a&&!s&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class et extends tt{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class it extends tt{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class st extends tt{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=G(this,t,e,0)??W)===j)return;const i=this._$AH,s=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==W&&(i===W||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){G(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(J,X),(w.litHtmlVersions??=[]).push("3.3.2");const nt=globalThis;let rt=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new X(e.insertBefore(V(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};rt._$litElement$=!0,rt.finalized=!0,nt.litElementHydrateSupport?.({LitElement:rt});const lt=nt.litElementPolyfillSupport;lt?.({LitElement:rt}),(nt.litElementVersions??=[]).push("4.2.2");const ct=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},dt={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:y},ht=(t=dt,e,i)=>{const{kind:s,metadata:o}=i;let a=globalThis.litPropertyMetadata.get(o);if(void 0===a&&globalThis.litPropertyMetadata.set(o,a=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pt(t){return(e,i)=>"object"==typeof i?ht(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ut(t){return pt({...t,state:!0,attribute:!1})}const gt=(t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i);function vt(t,e){return(i,s,o)=>{const a=e=>e.renderRoot?.querySelector(t)??null;if(e){const{get:t,set:e}="object"==typeof s?i:o??(()=>{const t=Symbol();return{get(){return this[t]},set(e){this[t]=e}}})();return gt(i,s,{get(){let i=t.call(this);return void 0===i&&(i=a(this),(null!==i||this.hasUpdated)&&e.call(this,i)),i}})}return gt(i,s,{get(){return a(this)}})}}function mt(t,e){return Promise.race([t,new Promise((t,i)=>setTimeout(()=>i(new Error(`Timeout ${e}`)),1e4))])}const bt="switch_manager",_t=["single","restart","queued","parallel"];function ft(t){return t?`/${bt}/${t}`:`/${bt}`}function yt(t){return`/assets/${bt}/${t}`}function xt(t){return`${bt}/${t}`}function $t(t){history.pushState(null,"",t);const e=new Event("location-changed");window.dispatchEvent(e)}function wt(t){const e={id:null,name:"New Switch",enabled:!0,identifier:"",blueprint:t,valid_blueprint:!0,buttons:[],is_mismatch:!1,rotate:0};return t.buttons.forEach((t,i)=>{e.buttons[i]={actions:[]},t.actions.forEach((t,s)=>{e.buttons[i].actions[s]={mode:_t[0],sequence:[]}})}),e}function kt(t,e,i){const s=new CustomEvent(e,{bubbles:!0,composed:!0,detail:i});t.dispatchEvent(s)}function Ct(t){kt(t,"dialog-closed",{dialog:t.localName})}function At(t,e){kt(t,"hass-notification",{message:e})}function St(t,e,i,s){kt(t,"show-dialog",{dialogTag:e,dialogImport:i,dialogParams:s})}let Et=class extends rt{constructor(){super(...arguments),this.heading="",this._pressOnBackdrop=!1,this._onKeydown=t=>{"Escape"===t.key&&this._close()}}connectedCallback(){super.connectedCallback(),document.addEventListener("keydown",this._onKeydown)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("keydown",this._onKeydown)}render(){return U`
      <div
        class="backdrop"
        @pointerdown=${this._onBackdropPress}
        @click=${this._onBackdropClick}
      >
        <div class="surface" @click=${this._stop}>
          <div class="header">
            <span class="title">${this.heading}</span>
            <ha-icon-button
              .path=${"M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"}
              label="Close"
              @click=${this._close}
            ></ha-icon-button>
          </div>
          <div class="content"><slot></slot></div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </div>
    `}_stop(t){t.stopPropagation()}_onBackdropPress(t){this._pressOnBackdrop=t.target===t.currentTarget}_onBackdropClick(t){const e=this._pressOnBackdrop;this._pressOnBackdrop=!1,t.target===t.currentTarget&&e&&this._close()}_close(){this.dispatchEvent(new CustomEvent("closed"))}static{this.styles=n`
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 10;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .surface {
      background: var(--card-background-color, #1c1c1c);
      color: var(--primary-text-color);
      border-radius: 12px;
      min-width: 300px;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 11px 15px -7px rgba(0, 0, 0, 0.2),
        0 24px 38px 3px rgba(0, 0, 0, 0.14), 0 9px 46px 8px rgba(0, 0, 0, 0.12);
    }
    .header {
      display: flex;
      align-items: center;
      padding: 12px 12px 0 24px;
    }
    .title {
      flex: 1;
      font-size: 1.25rem;
      font-weight: 500;
    }
    .content {
      padding: 8px 24px 16px;
      overflow-y: auto;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px 16px;
    }
    ::slotted(button) {
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
      text-transform: uppercase;
      font-weight: 500;
      color: var(--primary-color);
      padding: 8px 12px;
      border-radius: 4px;
    }
    ::slotted(button:hover) {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    ::slotted(button.destructive) {
      color: var(--error-color, #db4437);
    }
  `}};t([pt()],Et.prototype,"heading",void 0),Et=t([ct("switch-manager-dialog")],Et);let Lt=class extends rt{constructor(){super(...arguments),this._blueprints=[],this._filter="",this._protocol=""}showDialog(t){this._params=t,this.hass=this.parentElement?.hass||document.querySelector("home-assistant")?.hass,this._loadBlueprints()}closeDialog(){this._params&&(this._params=void 0,this._blueprints=[],this._filter="",this._protocol="",Ct(this))}_protoKey(t){return"event_entity"===t.event_type?(t.service||"").toLowerCase():(t.event_type||"").split(/[._]/)[0]}async _loadBlueprints(){const t=await this.hass.callWS({type:xt("blueprints")});this._blueprints=Object.values(t.blueprints)}render(){if(!this._params)return U``;const t=new Map;for(const e of this._blueprints){const i=this._protoKey(e);i&&t.set(i,(t.get(i)||0)+1)}const e=[...t.entries()].sort((t,e)=>e[1]-t[1]),i=this._blueprints.filter(t=>{const e=!this._filter||t.name.toLowerCase().includes(this._filter.toLowerCase())||t.service.toLowerCase().includes(this._filter.toLowerCase()),i=!this._protocol||this._protoKey(t)===this._protocol;return e&&i});return U`
      <switch-manager-dialog @closed=${this.closeDialog} heading="Select Blueprint">
        <input
          class="search"
          type="text"
          placeholder="Search"
          .value=${this._filter}
          @input=${t=>this._filter=t.target.value}
        />
        <select
          class="protocol"
          .value=${this._protocol}
          @change=${t=>this._protocol=t.target.value}
        >
          <option value="">All (${this._blueprints.length})</option>
          ${e.map(([t,e])=>U`<option value=${t}>${t} (${e})</option>`)}
        </select>
        <div class="blueprints">
          ${i.map(t=>U`
              <ha-card
                outlined
                class="blueprint-item"
                @click=${()=>this._selectBlueprint(t)}
              >
                <div class="card-content">
                  <div class="image">
                    ${t.has_image?U`<img src="${yt(t.id+".png")}" />`:U`<ha-svg-icon
                          .path=${"M13 5C15.21 5 17 6.79 17 9C17 10.5 16.2 11.77 15 12.46V11.24C15.61 10.69 16 9.89 16 9C16 7.34 14.66 6 13 6S10 7.34 10 9C10 9.89 10.39 10.69 11 11.24V12.46C9.8 11.77 9 10.5 9 9C9 6.79 10.79 5 13 5M20 20.5C19.97 21.32 19.32 21.97 18.5 22H13C12.62 22 12.26 21.85 12 21.57L8 17.37L8.74 16.6C8.93 16.39 9.2 16.28 9.5 16.28H9.7L12 18V9C12 8.45 12.45 8 13 8S14 8.45 14 9V13.47L15.21 13.6L19.15 15.79C19.68 16.03 20 16.56 20 17.14V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.11 2.9 14 4 14H8V12L4 12L4 4H20L20 12H18V14H20V13.96L20.04 14C21.13 14 22 13.09 22 12V4C22 2.9 21.11 2 20 2Z"}
                        ></ha-svg-icon>`}
                  </div>
                  <div class="info">
                    <div class="name">${t.name}</div>
                    <div class="service">${t.service}</div>
                  </div>
                </div>
              </ha-card>
            `)}
        </div>
        <button slot="actions" @click=${this.closeDialog}>Cancel</button>
      </switch-manager-dialog>
    `}_selectBlueprint(t){$t(ft(`new/${t.id}`)),this.closeDialog()}static{this.styles=n`
    .blueprints {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px;
      padding: 8px 0;
      max-height: 60vh;
      overflow-y: auto;
    }
    .blueprint-item {
      cursor: pointer;
    }
    .blueprint-item:hover {
      background: var(--secondary-background-color);
    }
    .card-content {
      text-align: center;
      padding: 8px;
    }
    .image {
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .image img {
      max-width: 100%;
      max-height: 80px;
    }
    .image ha-svg-icon {
      fill: var(--primary-color);
      width: 60px;
      height: 60px;
    }
    .name {
      font-weight: 500;
      margin-top: 8px;
    }
    .service {
      color: var(--secondary-text-color);
      font-size: 0.85em;
    }
    .search,
    .protocol {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 8px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
  `}};t([ut()],Lt.prototype,"_params",void 0),t([ut()],Lt.prototype,"_blueprints",void 0),t([ut()],Lt.prototype,"_filter",void 0),t([ut()],Lt.prototype,"_protocol",void 0),Lt=t([ct("switch-manager-dialog-blueprint-selector")],Lt);var Dt=Object.freeze({__proto__:null,get SwitchManagerDialogBlueprintSelector(){return Lt}});let Ht=class extends rt{constructor(){super(...arguments),this.path="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z",this.label="Menu",this.align="left",this._open=!1,this._onDocClick=t=>{t.composedPath().includes(this)||(this._open=!1)}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onDocClick)}render(){return U`
      <ha-icon-button
        .path=${this.path}
        .label=${this.label}
        @click=${this._toggle}
      ></ha-icon-button>
      <div
        class="surface ${this.align}"
        ?hidden=${!this._open}
        @click=${this._onSurfaceClick}
      >
        <slot></slot>
      </div>
    `}_toggle(t){t.stopPropagation(),this._open=!this._open}_onSurfaceClick(t){const e=t.target.closest(".menu-item");e&&e.hasAttribute("disabled")?t.stopPropagation():this._open=!1}static{this.styles=n`
    :host {
      position: relative;
      display: inline-flex;
    }
    .surface {
      position: absolute;
      top: 100%;
      z-index: 9;
      min-width: 200px;
      padding: 8px 0;
      background: var(--card-background-color, var(--paper-card-background-color, #1c1c1c));
      border-radius: 8px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
        0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
      color: var(--primary-text-color);
    }
    .surface.left {
      right: 0;
    }
    .surface.right {
      left: 0;
    }
    .surface[hidden] {
      display: none;
    }
    ::slotted(.menu-item) {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 16px;
      height: 48px;
      cursor: pointer;
      white-space: nowrap;
      box-sizing: border-box;
    }
    ::slotted(.menu-item:hover) {
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
    }
    ::slotted(.menu-item[disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    ::slotted(.menu-divider) {
      height: 1px;
      margin: 8px 0;
      background: var(--divider-color, rgba(255, 255, 255, 0.12));
    }
    ::slotted(.menu-item.warning) {
      color: var(--error-color, #db4437);
    }
  `}};t([pt()],Ht.prototype,"path",void 0),t([pt()],Ht.prototype,"label",void 0),t([pt()],Ht.prototype,"align",void 0),t([ut()],Ht.prototype,"_open",void 0),Ht=t([ct("switch-manager-menu")],Ht);let Vt=class extends rt{constructor(){super(...arguments),this.label="",this.path="",this.disabled=!1}render(){return U`
      <button type="button" ?disabled=${this.disabled} aria-label=${this.label}>
        <ha-svg-icon .path=${this.path}></ha-svg-icon>
        <span>${this.label}</span>
      </button>
    `}static{this.styles=n`
    :host {
      display: inline-block;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      height: 48px;
      padding: 0 20px 0 16px;
      border: none;
      border-radius: 16px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.1px;
      cursor: pointer;
      box-shadow:
        0 3px 5px -1px rgba(0, 0, 0, 0.2),
        0 6px 10px 0 rgba(0, 0, 0, 0.14),
        0 1px 18px 0 rgba(0, 0, 0, 0.12);
      transition: box-shadow 0.2s;
      white-space: nowrap;
    }
    button:hover,
    button:focus-visible {
      box-shadow:
        0 5px 5px -3px rgba(0, 0, 0, 0.2),
        0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
      outline: none;
    }
    button:disabled {
      cursor: default;
      opacity: 0.6;
      box-shadow: none;
    }
    ha-svg-icon {
      width: 24px;
      height: 24px;
    }
  `}};t([pt()],Vt.prototype,"label",void 0),t([pt()],Vt.prototype,"path",void 0),t([pt({type:Boolean,reflect:!0})],Vt.prototype,"disabled",void 0),Vt=t([ct("switch-manager-fab")],Vt);let Mt=class extends rt{constructor(){super(...arguments),this.narrow=!1,this._data=[],this._filter="",this._sortColumn="name",this._sortDirection="asc",this._revisions={}}connectedCallback(){super.connectedCallback();try{const t=JSON.parse(localStorage.getItem("switchManagerSort")||"{}");t.column&&(this._sortColumn=t.column),t.direction&&(this._sortDirection=t.direction)}catch{}this._populateSwitches()}get _filteredSortedData(){let t=this._data;if(this._filter){const e=this._filter.toLowerCase();t=t.filter(t=>t.name.toLowerCase().includes(e)||t.service.toLowerCase().includes(e)||t.type.toLowerCase().includes(e))}const e=this._sortColumn,i="asc"===this._sortDirection?1:-1;return[...t].sort((t,s)=>{if("enabled"===e)return((t.enabled?1:0)-(s.enabled?1:0))*i;const o=String(t[e]||"").toLowerCase(),a=String(s[e]||"").toLowerCase();return o.localeCompare(a)*i})}_toggleSort(t){this._sortColumn===t?this._sortDirection="asc"===this._sortDirection?"desc":"asc":(this._sortColumn=t,this._sortDirection="asc"),localStorage.setItem("switchManagerSort",JSON.stringify({column:this._sortColumn,direction:this._sortDirection}))}_sortIcon(t){return this._sortColumn!==t?W:U`<ha-svg-icon
      .path=${"asc"===this._sortDirection?"M7,15L12,10L17,15H7Z":"M7,10L12,15L17,10H7Z"}
    ></ha-svg-icon>`}_getOverflowItems(t){return[{path:t.enabled?"M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M9,9V15H15V9":"M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z",label:t.enabled?"Disable":"Enable",action:()=>this._toggleEnabled(t.switch_id,t.enabled)},{path:"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z",label:"Duplicate",action:()=>this._duplicate(t.switch_id)},{path:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",label:"Delete",action:()=>this._deleteConfirm(t),warning:!0}]}render(){const t=this._filteredSortedData;return U`
      <div class="toolbar">
        <ha-menu-button
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></ha-menu-button>
        <div class="main-title">Switch Manager</div>
        <div class="version">v${this.panel.config.version}</div>
      </div>
      <div class="view">
          <div class="content">
            <div class="search-bar">
              <ha-svg-icon .path=${"M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"}></ha-svg-icon>
              <input
                type="text"
                placeholder="Search"
                .value=${this._filter}
                @input=${t=>{this._filter=t.target.value}}
              />
            </div>
            <div class="table">
              <div class="thead">
                <div class="tr">
                  <div class="th col-image"></div>
                  <div
                    class="th col-name sortable"
                    @click=${()=>this._toggleSort("name")}
                  >
                    Name ${this._sortIcon("name")}
                  </div>
                  ${this.narrow?W:U`
                        <div
                          class="th col-service sortable"
                          @click=${()=>this._toggleSort("service")}
                        >
                          Service ${this._sortIcon("service")}
                        </div>
                        <div
                          class="th col-type sortable"
                          @click=${()=>this._toggleSort("type")}
                        >
                          Type ${this._sortIcon("type")}
                        </div>
                      `}
                  <div class="th col-actions"></div>
                </div>
              </div>
              <div class="tbody">
                ${0===t.length?U`<div class="empty">
                      ${0===this._data.length?"No Switches configured":"No matches found"}
                    </div>`:t.map(t=>U`
                        <div
                          class="tr row-item"
                          @click=${()=>this._editSwitch(t.switch_id)}
                        >
                          <div class="td col-image">
                            ${t.switch.valid_blueprint&&t.switch.blueprint.has_image?U`<img
                                  src="${yt(t.blueprint_id+".png")}"
                                />`:U`<ha-svg-icon
                                  .path=${"M13 5C15.21 5 17 6.79 17 9C17 10.5 16.2 11.77 15 12.46V11.24C15.61 10.69 16 9.89 16 9C16 7.34 14.66 6 13 6S10 7.34 10 9C10 9.89 10.39 10.69 11 11.24V12.46C9.8 11.77 9 10.5 9 9C9 6.79 10.79 5 13 5M20 20.5C19.97 21.32 19.32 21.97 18.5 22H13C12.62 22 12.26 21.85 12 21.57L8 17.37L8.74 16.6C8.93 16.39 9.2 16.28 9.5 16.28H9.7L12 18V9C12 8.45 12.45 8 13 8S14 8.45 14 9V13.47L15.21 13.6L19.15 15.79C19.68 16.03 20 16.56 20 17.14V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.11 2.9 14 4 14H8V12L4 12L4 4H20L20 12H18V14H20V13.96L20.04 14C21.13 14 22 13.09 22 12V4C22 2.9 21.11 2 20 2Z"}
                                ></ha-svg-icon>`}
                          </div>
                          <div class="td col-name">
                            <span class="name-text">
                              ${t.error?U`<span class="error"
                                    >${t.name} (${t.error})</span
                                  >`:t.name}
                            </span>
                            ${t.enabled?W:U`<span class="disabled-badge"
                                  >Disabled</span
                                >`}
                          </div>
                          ${this.narrow?W:U`
                                <div class="td col-service">
                                  ${t.service}
                                </div>
                                <div class="td col-type">${t.type}</div>
                              `}
                          <div class="td col-actions" @click=${t=>t.stopPropagation()}>
                            <switch-manager-menu align="left">
                              ${this._getOverflowItems(t).map(t=>U`
                                  <div
                                    class="menu-item ${t.warning?"warning":""}"
                                    @click=${t.action}
                                  >
                                    <ha-svg-icon .path=${t.path}></ha-svg-icon>
                                    ${t.label}
                                  </div>
                                `)}
                            </switch-manager-menu>
                          </div>
                        </div>
                      `)}
              </div>
            </div>
            <div class="fab-container">
              <switch-manager-fab
                label="Add Switch"
                .path=${"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"}
                @click=${this._showBlueprintDialog}
              ></switch-manager-fab>
            </div>
          </div>
      </div>
    `}_populateSwitches(){this.hass.callWS({type:xt("configs")}).then(t=>{this._revisions=t.revisions||{};const e=[];Object.values(t.configs).forEach(t=>{const i=t.valid_blueprint?t.blueprint:{id:t.blueprint,service:"",name:""};e.push({switch:t,blueprint_id:i.id,switch_id:t.id,error:t._error,enabled:t.enabled,name:t.name,service:i.service||"",type:i.name||"",actions:t.id})}),this._data=e})}_editSwitch(t){$t(ft(`edit/${t}`))}async _toggleEnabled(t,e){e?await this._applyEnabled(t,!1):St(this,"switch-manager-dialog-confirm",()=>Promise.resolve().then(function(){return ve}),{title:"Attivare il pulsante?",text:"Verifica dispositivo, blueprint e automazioni concorrenti. Le automazioni esterne non verranno disattivate.",confirmText:"Ho verificato, attiva",dismissText:"Annulla",confirm:()=>this._applyEnabled(t,!0)})}async _applyEnabled(t,e){try{const i=await this.hass.callWS({type:xt("config/enabled"),enabled:e,config_id:t,expected_revision:this._revisions[t],conflict_check:e});this._populateSwitches(),At(this,"Switch "+(i.enabled?"Enabled":"Disabled"))}catch(t){At(this,t.message)}}async _duplicate(t){try{const e=await this.hass.callWS({type:xt("config/duplicate"),config_id:t,expected_revision:this._revisions[t]});At(this,"Switch Duplicated"),$t(ft(`edit/${e.config_id}`))}catch(t){At(this,t.message)}}async _deleteConfirm(t){St(this,"switch-manager-dialog-confirm",()=>Promise.resolve().then(function(){return ve}),{title:"Delete switch?",text:`${t.name} will be permanently deleted.`,confirmText:"Delete",dismissText:"Cancel",confirm:()=>this._delete(t.switch_id),confirmation:!0,destructive:!0})}async _delete(t){try{await this.hass.callWS({type:xt("config/delete"),config_id:t.toString(),expected_revision:this._revisions[t]}),this._populateSwitches(),At(this,"Switch Deleted")}catch(t){At(this,t.message)}}_showBlueprintDialog(){St(this,"switch-manager-dialog-blueprint-selector",()=>Promise.resolve().then(function(){return Dt}),{})}static{this.styles=n`
    :host {
      display: block;
    }
    .view {
      display: block;
      height: calc(100vh - var(--header-height, 56px));
      overflow-y: auto;
    }
    .toolbar {
      display: flex;
      align-items: center;
      height: var(--header-height, 56px);
      box-sizing: border-box;
      padding: 0 12px;
      background-color: var(
        --app-header-background-color,
        var(--primary-color)
      );
      color: var(--app-header-text-color, var(--text-primary-color, #fff));
      font-size: 20px;
      font-weight: 400;
    }
    .toolbar .main-title {
      flex: 1;
      margin: 0 16px;
    }
    .toolbar .version {
      font-size: 14px;
      opacity: 0.8;
    }
    .menu-item ha-svg-icon {
      color: var(--secondary-text-color);
    }
    .menu-item.warning,
    .menu-item.warning ha-svg-icon {
      color: var(--error-color, #db4437);
    }
    .content {
      padding: 0;
    }

    /* Search */
    .search-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: var(--card-background-color, var(--ha-card-background, var(--secondary-background-color)));
      border-bottom: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
    }
    .search-bar ha-svg-icon {
      flex-shrink: 0;
      --mdc-icon-size: 24px;
    }
    .search-bar input {
      flex: 1;
      background: none;
      border: none;
      outline: none;
      font-size: 1em;
      color: var(--primary-text-color);
      font-family: inherit;
    }
    .search-bar input::placeholder {
      color: var(--secondary-text-color);
    }

    /* Table */
    .table {
      width: 100%;
    }
    .thead {
      border-bottom: 1px solid var(--divider-color);
    }
    .tr {
      display: flex;
      align-items: center;
    }
    .th {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--primary-text-color);
      padding: 8px 16px;
      user-select: none;
    }
    .th.sortable {
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .th.sortable:hover {
      color: var(--primary-color);
    }
    .th ha-svg-icon {
      width: 16px;
      height: 16px;
    }
    .row-item {
      border-bottom: 1px solid var(--divider-color);
      cursor: pointer;
    }
    .row-item:hover {
      background: var(--secondary-background-color);
    }
    .td {
      padding: 0 16px;
    }

    /* Columns */
    .col-image {
      width: 90px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .col-image img {
      max-width: 100%;
      max-height: 48px;
      display: block;
    }
    .col-image ha-svg-icon {
      color: var(--primary-color);
      width: 40px;
      height: 40px;
    }
    .col-name {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .name-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .disabled-badge {
      flex-shrink: 0;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid var(--divider-color);
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .col-service {
      width: 15%;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .col-type {
      width: 15%;
      flex-shrink: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .col-actions {
      width: 48px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: visible;
    }

    .error {
      color: var(--error-color, red);
    }
    .warning {
      color: var(--error-color);
    }
    .empty {
      text-align: center;
      padding: 32px;
      color: var(--secondary-text-color);
      font-size: 1.2em;
    }
    .fab-container {
      position: fixed;
      right: 0;
      bottom: 0;
      padding: 1.2em;
      z-index: 1;
    }
  `}};t([pt({attribute:!1})],Mt.prototype,"hass",void 0),t([pt({type:Boolean})],Mt.prototype,"narrow",void 0),t([pt({attribute:!1})],Mt.prototype,"panel",void 0),t([pt({attribute:!1})],Mt.prototype,"route",void 0),t([ut()],Mt.prototype,"_data",void 0),t([ut()],Mt.prototype,"_filter",void 0),t([ut()],Mt.prototype,"_sortColumn",void 0),t([ut()],Mt.prototype,"_sortDirection",void 0),Mt=t([ct("switch-manager-index")],Mt);const zt=1;class qt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}const Tt=(t=>(...e)=>({_$litDirective$:t,values:e}))(class extends qt{constructor(t){if(super(t),t.type!==zt||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return j}});let Nt=class extends rt{constructor(){super(...arguments),this.index=0}render(){return!this.blueprint_actions||this.blueprint_actions.length<=1?U``:U`
      <div class="tabs" role="tablist">
        ${this.blueprint_actions.map((t,e)=>{const i=this.config_actions?.[e]?.sequence?.length||0;return U`
            <button
              class="tab ${e===this.index?"selected":""}"
              role="tab"
              index="${e}"
              @click=${()=>this._select(e)}
            >
              <span class="title">${t.title}</span>
              ${i?U`<span class="chip">${i}</span>`:""}
              ${"init"===t.title?U`<ha-svg-icon
                    class="init-icon"
                    .path=${"M7,8L2.5,12L7,16V8M17,8V16L21.5,12L17,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z"}
                  ></ha-svg-icon>`:""}
            </button>
          `})}
      </div>
    `}flash(t){const e=this.tabs?.querySelector(`[index="${t}"]`);e&&(e.removeAttribute("feedback"),e.setAttribute("feedback",""),setTimeout(()=>e.removeAttribute("feedback"),1e3))}_select(t){this.dispatchEvent(new CustomEvent("changed",{detail:{index:t}}))}static{this.styles=n`
    @keyframes feedback {
      to {
        border-color: #00e903;
        color: #00e903;
      }
    }
    :host {
      display: flex;
      justify-content: center;
    }
    .tabs {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 4px;
      max-width: 100%;
      overflow-x: auto;
      margin: 0 10px;
    }
    .tab {
      position: relative;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--secondary-text-color);
      font: inherit;
      text-transform: uppercase;
      padding: 12px 32px;
      cursor: pointer;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .tab.selected {
      border-bottom-color: var(--primary-color);
      color: var(--primary-color);
    }
    .tab[feedback] {
      animation: 0.4s feedback;
      animation-iteration-count: 2;
      animation-direction: alternate;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      border-radius: 10px;
      font-size: 12px;
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .init-icon {
      --mdc-icon-size: 18px;
    }
  `}};t([pt({attribute:!1})],Nt.prototype,"hass",void 0),t([pt({attribute:!1})],Nt.prototype,"blueprint_actions",void 0),t([pt({attribute:!1})],Nt.prototype,"config_actions",void 0),t([pt({type:Number,reflect:!0})],Nt.prototype,"index",void 0),t([vt(".tabs",!0)],Nt.prototype,"tabs",void 0),Nt=t([ct("switch-manager-button-actions")],Nt);let Pt=class extends rt{constructor(){super(...arguments),this.narrow=!1,this.disabled=!1,this.sequence=[],this.button_index=0,this.action_index=0,this.is_new=!0,this._is_yaml=!1,this._dirty=!1,this._debug=!1,this._block_save=!1}render(){if(!this.config)return U``;const t=!!this.config._error;return U`
      <div class="toolbar">
        <ha-menu-button
          .hass=${this.hass}
          .narrow=${this.narrow}
        ></ha-menu-button>
        <ha-icon-button
          .path=${"M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"}
          @click=${this._backTapped}
        ></ha-icon-button>
        <div class="main-title">Switch Manager - ${this.config?.name}</div>
        <switch-manager-menu align="left">
          <div
            class="menu-item"
            ?disabled=${!this.config||t}
            @click=${()=>this._showIdentifierAutoDiscoveryDialog()}
          >
            <ha-svg-icon .path=${"M10 7V9H9V15H10V17H6V15H7V9H6V7H10M16 7C17.11 7 18 7.9 18 9V15C18 16.11 17.11 17 16 17H12V7M16 9H14V15H16V9Z"}></ha-svg-icon>
            Identifier
          </div>
          <div class="menu-item" @click=${()=>this._showRenameDialog()}>
            <ha-svg-icon .path=${"M18,17H10.5L12.5,15H18M6,17V14.5L13.88,6.65C14.07,6.45 14.39,6.45 14.59,6.65L16.35,8.41C16.55,8.61 16.55,8.92 16.35,9.12L8.47,17M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"}></ha-svg-icon>
            Rename
          </div>
          <div class="menu-item" @click=${this._rotate}>
            <ha-svg-icon .path=${"M16.89,15.5L18.31,16.89C19.21,15.73 19.76,14.39 19.93,13H17.91C17.77,13.87 17.43,14.72 16.89,15.5M13,17.9V19.92C14.39,19.75 15.74,19.21 16.9,18.31L15.46,16.87C14.71,17.41 13.87,17.76 13,17.9M19.93,11C19.76,9.61 19.21,8.27 18.31,7.11L16.89,8.53C17.43,9.28 17.77,10.13 17.91,11M15.55,5.55L11,1V4.07C7.06,4.56 4,7.92 4,12C4,16.08 7.05,19.44 11,19.93V17.91C8.16,17.43 6,14.97 6,12C6,9.03 8.16,6.57 11,6.09V10L15.55,5.55Z"}></ha-svg-icon>
            Rotate
          </div>
          <div
            class="menu-item"
            ?disabled=${!this.config||t}
            @click=${this._showVariablesEditorDialog}
          >
            <ha-svg-icon .path=${"M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z"}></ha-svg-icon>
            Variables
          </div>
          <div
            class="menu-item"
            ?disabled=${!this.config||t}
            @click=${this._showCopyFromDialog}
          >
            <ha-svg-icon .path=${"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"}></ha-svg-icon>
            Copy From
          </div>
          <div
            class="menu-item"
            ?disabled=${!this.config||this.is_new||t}
            @click=${this._toggleEnabled}
          >
            <ha-svg-icon .path=${"M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4M9,9V15H15V9"}></ha-svg-icon>
            ${this.config?.enabled?"Disable":"Enable"}
          </div>
          <div class="menu-divider"></div>
          <div
            class="menu-item"
            ?disabled=${!this.config||this.is_new||t}
            @click=${this._toggleDebug}
          >
            <ha-svg-icon .path=${"M14,12H10V10H14M14,16H10V14H14M20,8H17.19C16.74,7.22 16.12,6.55 15.37,6.04L17,4.41L15.59,3L13.42,5.17C12.96,5.06 12.5,5 12,5C11.5,5 11.04,5.06 10.59,5.17L8.41,3L7,4.41L8.62,6.04C7.88,6.55 7.26,7.22 6.81,8H4V10H6.09C6.04,10.33 6,10.66 6,11V12H4V14H6V15C6,15.34 6.04,15.67 6.09,16H4V18H6.81C7.85,19.79 9.78,21 12,21C14.22,21 16.15,19.79 17.19,18H20V16H17.91C17.96,15.67 18,15.34 18,15V14H20V12H18V11C18,10.66 17.96,10.33 17.91,10H20V8Z"}></ha-svg-icon>
            Debug
          </div>
          <div class="menu-divider"></div>
          <div
            class="menu-item ${Tt({warning:!this.is_new})}"
            ?disabled=${this.is_new}
            @click=${this._deleteConfirm}
          >
            <ha-svg-icon .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}></ha-svg-icon>
            Delete
          </div>
        </switch-manager-menu>
      </div>

      <div class="view">
          ${t?W:U`<h3 id="blueprint-name">${this.blueprint?.service} / ${this.blueprint?.name}</h3>`}

          <div id="switch-image" rotate="${this.config.rotate}">
            ${!this.blueprint||this.blueprint?.has_image?U`<svg id="switch-svg"></svg>`:U`<ha-svg-icon .path=${"M13 5C15.21 5 17 6.79 17 9C17 10.5 16.2 11.77 15 12.46V11.24C15.61 10.69 16 9.89 16 9C16 7.34 14.66 6 13 6S10 7.34 10 9C10 9.89 10.39 10.69 11 11.24V12.46C9.8 11.77 9 10.5 9 9C9 6.79 10.79 5 13 5M20 20.5C19.97 21.32 19.32 21.97 18.5 22H13C12.62 22 12.26 21.85 12 21.57L8 17.37L8.74 16.6C8.93 16.39 9.2 16.28 9.5 16.28H9.7L12 18V9C12 8.45 12.45 8 13 8S14 8.45 14 9V13.47L15.21 13.6L19.15 15.79C19.68 16.03 20 16.56 20 17.14V20.5M20 2H4C2.9 2 2 2.9 2 4V12C2 13.11 2.9 14 4 14H8V12L4 12L4 4H20L20 12H18V14H20V13.96L20.04 14C21.13 14 22 13.09 22 12V4C22 2.9 21.11 2 20 2Z"}></ha-svg-icon>`}
          </div>

          ${t?W:U`
            <switch-manager-button-actions
              .hass=${this.hass}
              .blueprint_actions=${this.blueprint?.buttons[this.button_index]?.actions}
              .config_actions=${this.config.buttons[this.button_index]?.actions}
              .index=${this.action_index}
              @changed=${this._actionChanged}
            ></switch-manager-button-actions>
          `}

          <ha-card outlined>
            <div class="card-content">
              ${this._errors?U`
                    <ha-alert alert-type="error">
                      ${this._errors}
                      ${this.config.is_mismatch?U`<button slot="action" class="alert-action" @click=${this._fixMismatch}>Fix</button>`:""}
                    </ha-alert>
                  `:""}
              ${this.config&&!this.config.enabled?U`
                    <ha-alert alert-type="info">
                      Switch is disabled
                      <button slot="action" class="alert-action" @click=${this._toggleEnabled}>Enable</button>
                    </ha-alert>
                  `:""}
              ${t?W:U`
                <div id="sequence-container">
                  <div class="header">
                    <h2 id="sequence-heading" class="name">
                      Sequence
                      <ha-selector-select
                        id="mode-selector"
                        .hass=${this.hass}
                        .value=${this.config?.buttons[this.button_index]?.actions[this.action_index]?.mode}
                        label="Mode"
                        .selector=${{select:{mode:"dropdown",options:_t.map(t=>({label:t.charAt(0).toUpperCase()+t.slice(1),value:t}))}}}
                        @value-changed=${this._modeValueChanged}
                      ></ha-selector-select>
                      ${this._canLoop()?U`
                            <span id="loop-options">
                              <ha-formfield
                                label="Repeat until ${this._releaseTitle()}"
                                title="Run the sequence again and again until the release event of this button arrives"
                              >
                                <ha-switch
                                  .checked=${!!this._currentAction()?.loop}
                                  @change=${this._loopChanged}
                                ></ha-switch>
                              </ha-formfield>
                              ${this._currentAction()?.loop?U`<label id="loop-interval">
                                    <span>Interval (ms)</span>
                                    <input
                                      type="number"
                                      min="50"
                                      max="5000"
                                      step="50"
                                      .value=${String(this._currentAction()?.loop_interval??250)}
                                      @change=${this._loopIntervalChanged}
                                    />
                                  </label>`:W}
                            </span>
                          `:W}
                    </h2>
                    <switch-manager-menu align="left">
                      <div class="menu-item" @click=${this._toggleYaml}>
                        <ha-svg-icon .path=${this._is_yaml?"M21 13.1C20.9 13.1 20.7 13.2 20.6 13.3L19.6 14.3L21.7 16.4L22.7 15.4C22.9 15.2 22.9 14.8 22.7 14.6L21.4 13.3C21.3 13.2 21.2 13.1 21 13.1M19.1 14.9L13 20.9V23H15.1L21.2 16.9L19.1 14.9M21 3H13V9H21V3M19 7H15V5H19V7M13 18.06V11H21V11.1C20.24 11.1 19.57 11.5 19.19 11.89L18.07 13H15V16.07L13 18.06M11 3H3V13H11V3M9 11H5V5H9V11M11 20.06V15H3V21H11V20.06M9 19H5V17H9V19Z":"M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z"}></ha-svg-icon>
                        ${this._is_yaml?"Visual Editor":"Yaml Editor"}
                      </div>
                    </switch-manager-menu>
                  </div>
                  ${this._is_yaml?U`<ha-yaml-editor
                        .hass=${this.hass}
                        .value=${this.sequence}
                        @value-changed=${this._configSequenceChanged}
                      ></ha-yaml-editor>`:U`<ha-automation-action
                        .hass=${this.hass}
                        role="region"
                        aria-labelledby="sequence-heading"
                        .actions=${this.sequence}
                        @value-changed=${this._configSequenceChanged}
                        .narrow=${this.narrow}
                        .disabled=${this.disabled}
                      ></ha-automation-action>`}
                </div>
              `}
            </div>
          </ha-card>

          ${t?W:U`
            <div class="fab-container">
              <switch-manager-fab
                label="Save"
                .path=${"M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z"}
                collapse
                @click=${this._save}
                class=${Tt({dirty:this._dirty,blocked:this._block_save})}
              ></switch-manager-fab>
            </div>
          `}
        </div>
    `}connectedCallback(){super.connectedCallback(),this._loadConfig(),this._startListeners()}disconnectedCallback(){this._killListener("_reloadListener"),this._killListener("_subscribedMonitor"),super.disconnectedCallback()}_killListener(t){return!!this[t]&&(this[t](),this[t]=void 0,!0)}async _startListeners(){this._reloadListener=await this.hass.connection.subscribeEvents(t=>{"switch_manager"===t.data.domain&&"reload"===t.data.service&&this._loadConfig()},"call_service")}_loadConfig(){this.config&&this._dirty?this._errors="La configurazione remota è cambiata. Conserva la bozza e ricarica prima di salvare.":"id"in this.params?(this.is_new=!1,this.hass.callWS({type:xt("configs"),config_id:this.params.id}).then(t=>{this.config&&this._dirty?this._errors="La configurazione remota è cambiata. La bozza è stata conservata.":(this._revision=t.revision,this._setConfig(t.config))})):(this.is_new=!0,this._dirty=!0,"blueprint"in this.params&&this._loadBlueprint(this.params.blueprint).then(t=>{this._setConfig(wt(t.blueprint)),this._showRenameDialog(!0)}))}_loadBlueprint(t){return this.hass.callWS({type:xt("blueprints"),blueprint_id:t})}_setConfig(t){if(this.config=t,t._error)return this._errors=t._error,void(this._block_save=!0);this._setBlueprint(t.blueprint),this._updateSequence(),this._monitor()}async _monitor(){this.is_new||(this._killListener("_subscribedMonitor"),this._subscribedMonitor=await this.hass.connection.subscribeMessage(t=>{if("action_triggered"===t.event){if(!this.config?.identifier)return;if(t.button===this.button_index&&(this.blueprint?.buttons[this.button_index]?.actions.length??0)>1&&this.button_actions.flash(t.action),1===this.blueprint?.buttons?.length)return void At(this,"Button Pressed");const e=this.svg?.querySelector(`[index="${t.button}"]`);e&&(e.removeAttribute("pressed"),e.setAttribute("pressed",""),setTimeout(()=>e.removeAttribute("pressed"),1e3))}"incoming"!==t.event&&"action_triggered"!==t.event||!this._debug||console.log(t)},{type:xt("config/monitor"),config_id:this.config.id}))}_setBlueprint(t){this.blueprint=t,this.requestUpdate(),this._drawSVG()}async _drawSVG(){if(!this.blueprint?.has_image)return;await this.updateComplete;const t=this.svg;if(t){const e=t.cloneNode(!1);t.parentNode.replaceChild(e,t)}const e=new Image;e.src=yt(`${this.blueprint.id}.png`),e.onload=()=>{const t=this.svg;if(!t)return;t.setAttributeNS(null,"viewBox",`0 0 ${e.width} ${e.height}`);const i=document.createElementNS("http://www.w3.org/2000/svg","image");i.setAttributeNS(null,"x","0"),i.setAttributeNS(null,"y","0"),i.setAttributeNS(null,"width",e.width.toString()),i.setAttributeNS(null,"height",e.height.toString()),i.setAttributeNS("http://www.w3.org/1999/xlink","href",e.src),i.setAttributeNS(null,"visibility","visible"),t.prepend(i)},this.blueprint.buttons.length>1&&this.blueprint.buttons.forEach((t,e)=>{let i;if(t.x>-1&&t.y>-1&&t.width>0&&t.height>0)i=document.createElementNS("http://www.w3.org/2000/svg","rect"),i.setAttributeNS(null,"x",t.x.toString()),i.setAttributeNS(null,"y",t.y.toString()),i.setAttributeNS(null,"width",t.width.toString()),i.setAttributeNS(null,"height",t.height.toString());else if(t.x>-1&&t.y>-1&&t.width>0)i=document.createElementNS("http://www.w3.org/2000/svg","circle"),i.setAttributeNS(null,"cx",t.x.toString()),i.setAttributeNS(null,"cy",t.y.toString()),i.setAttributeNS(null,"r",t.width.toString());else{if(!t.d)return;i=document.createElementNS("http://www.w3.org/2000/svg","path"),i.setAttributeNS(null,"d",t.d.toString())}i.setAttribute("class","button"),i.setAttribute("index",e.toString()),this.button_index===e&&i.setAttribute("selected",""),this._buttonTotalSequence(this.config.buttons[e])||i.setAttribute("empty",""),i.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),this._setButtonIndex(parseInt(t.target.getAttribute("index")))}),this.svg?.append(i)})}_buttonTotalSequence(t){let e=0;return t.actions.forEach(t=>e+=t.sequence.length),e}_updateSequence(t){t&&(this.config.buttons[this.button_index].actions[this.action_index].sequence=t),this.sequence=[...this.config?.buttons[this.button_index]?.actions[this.action_index]?.sequence||[]]}_validate(){return this._errors=void 0,!!this.config?.identifier||(this._showIdentifierAutoDiscoveryDialog({continueSave:!0}),!1)}_save(){!this._block_save&&this._validate()&&this.config&&!this.config._error&&(this._block_save=!0,this._dirty=!1,this.hass.callWS({type:xt("config/save"),expected_revision:this._revision,config:{...this.config,blueprint:this.config.blueprint.id}}).then(t=>{this._revision=t.revision,this.is_new&&(this.is_new=!1,this.config.id=t.config_id,$t(ft(`edit/${t.config_id}`))),this._dirty?this.config&&(this.config.enabled=t.config.enabled):this._setConfig(t.config),At(this,this._dirty?"Salvato. Le modifiche successive restano nella bozza.":"Switch Saved")}).catch(t=>{At(this,t.message),this._errors=t.message,this._dirty=!0}).finally(()=>this._block_save=!1))}_backTapped(){$t(ft())}_actionChanged(t){this._setActionIndex(t.detail.index)}_setButtonIndex(t){t!==this.button_index&&(this.button_index=t,this.svg?.querySelector("[selected]")?.removeAttribute("selected"),this.svg?.querySelector(`[index="${t}"]`)?.setAttribute("selected",""),this._setActionIndex(0))}_setActionIndex(t){this.action_index=t,this._updateSequence(),this._is_yaml&&this._yamlEditor?.setValue(this.sequence)}_configSequenceChanged(t){let e=t.detail.value;!this._is_yaml||e&&Array.isArray(e)||(e=[]),this.requestUpdate("config"),this._updateSequence(e),this._errors=void 0,this._dirty=!0}_rotate(){this.config.rotate=this.config.rotate>=3?0:this.config.rotate+1,this.requestUpdate("config"),this._dirty=!0}_toggleDebug(){this._debug=!this._debug,At(this,"Debug "+(this._debug?"Enabled. View dev console":"Disabled"))}_toggleYaml(){this._is_yaml=!this._is_yaml,this.updateComplete.then(()=>{this._is_yaml&&this._yamlEditor?.setValue(this.sequence)})}_currentAction(){return this.config?.buttons[this.button_index]?.actions[this.action_index]}_currentBlueprintAction(){return this.blueprint?.buttons[this.button_index]?.actions[this.action_index]}_canLoop(){const t=this._currentBlueprintAction()?.release_index;return null!=t}_releaseTitle(){const t=this._currentBlueprintAction()?.release_index;return null==t?"release":this.blueprint?.buttons[this.button_index]?.actions[t]?.title??"release"}_loopChanged(t){const e=this._currentAction();if(!e)return;const i=t.target.checked;!!e.loop!==i&&(e.loop=i,i&&!e.loop_interval&&(e.loop_interval=250),this.requestUpdate("config"),this._dirty=!0)}_loopIntervalChanged(t){const e=this._currentAction();if(!e)return;let i=parseInt(t.target.value,10);isNaN(i)&&(i=250),i=Math.min(5e3,Math.max(50,i)),e.loop_interval!==i&&(e.loop_interval=i,this.requestUpdate("config"),this._dirty=!0)}_modeValueChanged(t){const e=this.config?.buttons[this.button_index]?.actions[this.action_index]?.mode;e!==t.detail.value&&(this.config.buttons[this.button_index].actions[this.action_index].mode=t.detail.value,this.requestUpdate("config"),this._dirty=!0)}_toggleEnabled(){this.config&&!this.is_new&&(this._dirty||this._block_save?At(this,"Salva o annulla le modifiche prima di cambiare attivazione."):this.config.enabled?this._applyEnabled(!1):St(this,"switch-manager-dialog-confirm",()=>Promise.resolve().then(function(){return ve}),{title:"Attivare il pulsante?",text:"Verifica dispositivo, blueprint e automazioni concorrenti. Le automazioni esterne non verranno disattivate.",confirmText:"Ho verificato, attiva",dismissText:"Annulla",confirm:()=>this._applyEnabled(!0)}))}async _applyEnabled(t){this._block_save=!0;try{const e=await this.hass.callWS({type:xt("config/enabled"),enabled:t,config_id:this.config.id,expected_revision:this._revision,conflict_check:t});this._revision=e.revision,this._setConfig(e.config)}catch(t){this._errors=t.message,At(this,t.message)}finally{this._block_save=!1}}_fixMismatch(){this.config&&this.hass.callWS({type:xt("config/save"),config:{...this.config,blueprint:this.config.blueprint.id},fix_mismatch:!0,expected_revision:this._revision}).then(t=>{this._errors=void 0,this._block_save=!1,this.button_index=0,this.action_index=0,this._setConfig(t.config),this._revision=t.revision,At(this,"Mismatch Fixed")}).catch(t=>{this._errors=t.message,At(this,t.message)})}_deleteConfirm(){this.is_new||St(this,"switch-manager-dialog-confirm",()=>Promise.resolve().then(function(){return ve}),{title:"Delete switch?",text:`${this.config?.name} will be permanently deleted.`,confirmText:"Delete",dismissText:"Cancel",confirm:()=>{this.hass.callWS({type:xt("config/delete"),config_id:this.config.id.toString(),expected_revision:this._revision}).then(()=>$t(ft()))},confirmation:!0,destructive:!0})}_showIdentifierAutoDiscoveryDialog({continueSave:t=!1,creating:e=!1}={}){St(this,"switch-manager-dialog-identifier-auto-discovery",()=>Promise.resolve().then(function(){return fe}),{switch_id:this.config?.id,identifier:this.config?.identifier,blueprint:this.blueprint,required:t,update:e=>{this.config.identifier=e.identifier,this._dirty=!0,this.requestUpdate(),t&&e.identifier&&this._save()},onClose:t=>{!e||t||this.config?.identifier||$t(ft())}})}_showRenameDialog(t=!1){St(this,"switch-manager-dialog-rename-switch",()=>Promise.resolve().then(function(){return xe}),{config:this.config,update:t=>{this.config.name=t.name,this._dirty=!0,this.requestUpdate()},onClose:e=>{t&&(e?this._showIdentifierAutoDiscoveryDialog({creating:!0}):$t(ft()))}})}_showCopyFromDialog(){St(this,"switch-manager-dialog-copy-from",()=>Promise.resolve().then(function(){return we}),{blueprint_id:this.config?.blueprint?.id,current_switch_id:this.config?.id,update:t=>{this.config.buttons=t.buttons,!1!==t.variables&&(this.config.variables=t.variables),this._dirty=!0,this._updateSequence(),this._drawSVG()},onClose:()=>{}})}_showVariablesEditorDialog(){St(this,"switch-manager-dialog-variables-editor",()=>Promise.resolve().then(function(){return Ce}),{config:this.config,update:t=>{this.config.variables=t.variables,this._dirty=!0,this.requestUpdate()},onClose:()=>{}})}static{this.styles=n`
    @keyframes pressed {
      to {
        fill: #3ff17975;
        stroke: #00e903;
      }
    }
    :host {
      --max-width: 1040px;
    }
    .toolbar {
      display: flex;
      align-items: center;
      height: var(--header-height, 56px);
      box-sizing: border-box;
      padding: 0 12px;
      background-color: var(
        --app-header-background-color,
        var(--app-header-background-color, var(--primary-color))
      );
      color: var(--app-header-text-color, var(--text-primary-color, #fff));
      font-size: 20px;
      font-weight: 400;
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .toolbar .main-title {
      flex: 1;
      margin: 0 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .menu-item ha-svg-icon {
      color: var(--secondary-text-color);
    }
    .menu-item.warning,
    .menu-item.warning ha-svg-icon {
      color: var(--error-color, #db4437);
    }
    .alert-action {
      background: none;
      border: none;
      cursor: pointer;
      font: inherit;
      text-transform: uppercase;
      font-weight: 500;
      color: var(--primary-color);
      padding: 8px 12px;
    }
    ha-card {
      margin: 0 auto;
      max-width: var(--max-width);
      --mdc-select-fill-color: transparent;
    }
    switch-manager-button-actions {
      max-width: var(--max-width);
      margin: 0 auto;
    }
    h3 {
      padding-left: 25px;
    }
    .view {
      height: calc(100vh - var(--header-height, 56px));
      display: block;
      overflow-y: auto;
      padding-bottom: 3em;
      box-sizing: border-box;
    }
    .header {
      display: flex;
      align-items: center;
    }
    .header:first-child {
      margin-top: -16px;
    }
    .header .name {
      font-size: 20px;
      font-weight: 400;
      flex: 1;
      margin-top: 0;
    }
    #switch-image {
      max-height: 380px;
      display: flex;
      margin: 1em;
      justify-content: center;
    }
    #switch-image[rotate="1"] svg {
      rotate: 90deg;
      max-width: 380px;
    }
    #switch-image[rotate="2"] svg {
      rotate: 180deg;
    }
    #switch-image[rotate="3"] svg {
      rotate: 270deg;
      max-width: 380px;
    }
    #sequence-container {
      padding: 28px 20px 0;
    }
    #mode-selector {
      display: inline-block;
      margin-left: 20px;
    }
    #loop-options {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-left: 20px;
      font-size: 14px;
      font-weight: normal;
      vertical-align: middle;
    }
    #loop-interval {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    #loop-interval input {
      width: 80px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    #loop-interval input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    #switch-image > svg {
      overflow: visible;
      max-width: 800px;
    }
    #switch-image ha-svg-icon {
      fill: var(--primary-color);
      width: 260px;
      height: 260px;
    }
    #switch-image svg image {
      filter: drop-shadow(0px 0px 8px #00000033);
    }
    #switch-image svg .button {
      fill: #00000000;
      stroke: #00adff3d;
      stroke-width: 3;
      cursor: pointer;
    }
    #switch-image svg .button[empty] {
      fill: #cfcfcf66;
    }
    #switch-image svg .button[selected] {
      fill: #6bd3ff75;
      stroke: #0082e9;
    }
    #switch-image svg .button[pressed] {
      animation: 0.4s pressed;
      animation-iteration-count: 2;
      animation-direction: alternate;
    }
    .warning {
      color: var(--error-color);
    }
    .fab-container {
      position: fixed;
      right: 0;
      bottom: 0;
      overflow: hidden;
      padding: 1.2em;
      z-index: 1;
    }
    switch-manager-fab {
      position: relative;
    }
    switch-manager-fab[collapse] {
      bottom: calc(-80px - env(safe-area-inset-bottom));
      transition: bottom 0.3s;
    }
    switch-manager-fab.dirty {
      bottom: 0;
    }
    switch-manager-fab.blocked {
      bottom: calc(-80px - env(safe-area-inset-bottom));
    }
  `}};t([pt({attribute:!1})],Pt.prototype,"hass",void 0),t([pt({type:Boolean})],Pt.prototype,"narrow",void 0),t([pt({attribute:!1})],Pt.prototype,"panel",void 0),t([pt({attribute:!1})],Pt.prototype,"route",void 0),t([pt({attribute:!1})],Pt.prototype,"params",void 0),t([pt({attribute:!1})],Pt.prototype,"blueprint",void 0),t([pt({attribute:!1})],Pt.prototype,"config",void 0),t([pt({type:Boolean})],Pt.prototype,"disabled",void 0),t([ut()],Pt.prototype,"_subscribedMonitor",void 0),t([ut()],Pt.prototype,"_reloadListener",void 0),t([ut()],Pt.prototype,"sequence",void 0),t([ut()],Pt.prototype,"button_index",void 0),t([ut()],Pt.prototype,"action_index",void 0),t([ut()],Pt.prototype,"is_new",void 0),t([ut()],Pt.prototype,"_is_yaml",void 0),t([ut()],Pt.prototype,"_dirty",void 0),t([ut()],Pt.prototype,"_debug",void 0),t([ut()],Pt.prototype,"_block_save",void 0),t([ut()],Pt.prototype,"_errors",void 0),t([vt("#switch-svg")],Pt.prototype,"svg",void 0),t([vt("switch-manager-button-actions")],Pt.prototype,"button_actions",void 0),t([vt("ha-yaml-editor")],Pt.prototype,"_yamlEditor",void 0),Pt=t([ct("switch-manager-switch-editor")],Pt);class Bt{constructor(t){this.hass=t}snapshot(){return this.hass.callWS({type:"switch_manager/farhome/snapshot"})}get(t){return this.hass.callWS({type:"switch_manager/farhome/config/get",config_id:t})}save(t,e,i,s=[],o=[]){return this.hass.callWS({type:"switch_manager/farhome/config/save",config:{...t,blueprint:"string"==typeof t.blueprint?t.blueprint:t.blueprint.id},metadata:e,expected_revision:i,quick_actions:s,selector_actions:o})}setEnabled(t,e,i,s){return this.hass.callWS({type:"switch_manager/farhome/config/enabled",config_id:t,enabled:e,expected_revision:i,conflict_check:s})}saveMetadata(t,e){return this.hass.callWS({type:"switch_manager/farhome/metadata/save",patch:t,expected_revision:e})}getSelector(t,e){return this.hass.callWS({type:"switch_manager/farhome/selector/get",entity_id:t,config_id:e})}updateSelector(t,e,i,s,o,a){return this.hass.callWS({type:"switch_manager/farhome/selector/update",entity_id:t.entity_id,config_id:e,options:i,active:s,initial:o,expected_revision:t.revision,dependencies_acknowledged:a})}}const It={title:"Pulsanti",rooms:"Stanze",no_room:"Senza stanza",unassociated:"Da associare",gestures:"Gesti",function:"Funzione",target:"Destinatario",target_type:"Tipo di destinatario",light:"Luce",fan:"Ventilatore",switch:"Presa / interruttore",scene:"Scena",script:"Script",action_toggle:"Accendi / spegni",action_on:"Accendi",action_off:"Spegni",action_increase:"Aumenta",action_decrease:"Riduci",action_activate:"Attiva scena",action_run:"Esegui script",save:"Salva gesti",cancel:"Annulla",back:"Indietro",loading:"Caricamento…",retry:"Riprova",managed:"Configurato in Farhome",external:"Gestito esternamente",unknown:"Da verificare",verified:"Blueprint verificato",unverified:"Compatibilità da verificare",advanced:"Sequenza avanzata",dirty:"Modifiche non salvate",empty_room:"Nessun pulsante in questa stanza.",select_device:"Scegli un pulsante per configurare i gesti.",legacy:"Editor originale",unavailable:"Non disponibile",mode:"Modalità",step_brightness:"Passo luminosità (%)",step_speed:"Passo velocità (%)",transition:"Transizione (s)",brightness:"Luminosità (%)",kelvin:"Temperatura colore (K)",percentage:"Velocità (%)"},Ot={title:"Buttons",rooms:"Rooms",no_room:"No room",unassociated:"Unassigned",gestures:"Gestures",function:"Function",target:"Target",target_type:"Target type",light:"Light",fan:"Fan",switch:"Plug / switch",scene:"Scene",script:"Script",action_toggle:"Toggle",action_on:"Turn on",action_off:"Turn off",action_increase:"Increase",action_decrease:"Decrease",action_activate:"Activate scene",action_run:"Run script",save:"Save gestures",cancel:"Cancel",back:"Back",loading:"Loading…",retry:"Retry",managed:"Configured in Farhome",external:"Managed externally",unknown:"To verify",verified:"Verified blueprint",unverified:"Compatibility unverified",advanced:"Advanced sequence",dirty:"Unsaved changes",empty_room:"No buttons in this room.",select_device:"Choose a button to configure its gestures.",legacy:"Original editor",unavailable:"Unavailable",mode:"Mode",step_brightness:"Brightness step (%)",step_speed:"Speed step (%)",transition:"Transition (s)",brightness:"Brightness (%)",kelvin:"Color temperature (K)",percentage:"Speed (%)"},Rt={selector:["Selettore di luci","Light selector"],helper:["Helper luci","Light helper"],link_helper:["Collega helper","Link helper"],helper_pending:["Salva gesti per collegare l’helper. Verifica poi l’attivazione prima di modificare l’elenco.","Save gestures to link the helper. Verify activation before editing the list."],helper_migration:["Il collegamento richiede una configurazione Farhome attiva e verificata.","Linking requires an active, verified Farhome configuration."],ordered_lights:["Elenco ordinato","Ordered lights"],active_light:["Luce attiva","Active light"],initial_light:["Luce iniziale","Initial light"],active_missing:["Destinatario attivo non disponibile","Active target unavailable"],no_initial:["Nessuna luce iniziale configurata","No initial light configured"],apply_list:["Applica elenco","Apply list"],list_applied:["Elenco applicato","List applied"],reload_list:["Ricarica elenco","Reload list"],add_light:["Aggiungi luce","Add light"],light_to_add:["Luce da aggiungere","Light to add"],up:["Sposta su","Move up"],down:["Sposta giù","Move down"],remove:["Rimuovi","Remove"],yaml_readonly:["Definito in YAML o origine non risolta: elenco in sola lettura.","Defined in YAML or unresolved origin: read-only list."],controller_readonly:["Il controller deve essere attivo e migrato per modificare l’elenco.","The controller must be active and migrated to edit the list."],known_dependencies:["Riferimenti conosciuti","Known references"],dependencies_notice:["Questo elenco può essere usato anche altrove. I riferimenti mostrati non sono un inventario completo delle dipendenze.","This list may be used elsewhere. The references shown are not a complete dependency inventory."],dependencies_ack:["Ho verificato le dipendenze note di questo helper.","I have checked this helper’s known dependencies."],list_invalid:["Scegli almeno una luce esistente, senza duplicati, e sostituisci le selezioni rimosse.","Choose at least one existing light without duplicates, and replace removed selections."],helper_draft_pending:["Applica l’elenco o scartane la bozza prima di uscire; Salva gesti non modifica l’helper.","Apply the list or discard its draft before leaving; Save gestures does not change the helper."],fixed_target:["Destinatario fisso","Fixed target"],use_selector:["Usa selettore per questo gesto","Use selector for this gesture"],confirm_selector:["Conferma gesto selettore","Confirm selector gesture"],selector_function:["Funzione selettore","Selector function"],next_light:["Seleziona luce successiva","Select next light"],dim_up:["Aumenta luminosità selezionata","Increase selected brightness"],dim_down:["Riduci luminosità selezionata","Decrease selected brightness"],selector_summary:["Verrà sostituito soltanto questo gesto. Gli altri gesti, inclusi doppio click, pressione prolungata e feedback avanzati, restano invariati.","Only this gesture will be replaced. Other gestures, including double click, hold and advanced feedback, stay unchanged."],configuration:["Configurazione","Configuration"],choose_configuration:["Scegli una configurazione","Choose a configuration"],add_button:["Aggiungi pulsante","Add controller"],registered_device:["Dispositivo registrato","Registered device"],add_to_list:["Aggiungi alla lista","Add to list"],associate_device:["Dispositivo da associare","Device to associate"],link_config:["Collega configurazione","Link configuration"],no_unassociated:["Nessuna configurazione da associare.","No unassigned configurations."],blueprint:["Modello / blueprint","Model / blueprint"],identifier:["Identificatore eventi","Event identifier"],name:["Nome","Name"],create_draft:["Crea bozza disabilitata","Create disabled draft"],prepare:["Prepara configurazione Farhome","Prepare Farhome configuration"],external_notice:["La gestione esterna resta attiva. Puoi preparare una configurazione Farhome disabilitata; il passaggio richiede una verifica separata.","External management remains active. Prepare a disabled Farhome configuration; switching requires a separate check."],no_config:["Non ci sono configurazioni associate a questo dispositivo.","No configuration is associated with this device."],choose:["Scegli…","Choose…"],button:["Tasto","Button"],configure_quick:["Configura azione rapida","Configure quick action"],other_actions:["Altre azioni","Other actions"],no_action:["Nessuna azione","No action"],advanced_notice:["Questa sequenza viene conservata integralmente. Puoi modificarla nell’editor Home Assistant.","This sequence is preserved in full. Edit it with the Home Assistant editor."],replace_advanced:["Sostituire la sequenza avanzata di questo gesto? Ritardi, condizioni e altre azioni saranno sostituiti dalla nuova azione rapida.","Replace this gesture’s advanced sequence? Delays, conditions and other actions will be replaced by the new quick action."],replace:["Sostituisci questo gesto","Replace this gesture"],saved:["Salvato","Saved"],saving:["Salvataggio…","Saving…"],reload:["Ricarica dal server","Reload from server"],stay:["Resta","Stay"],discard:["Scarta","Discard"],save_leave:["Salva e prosegui","Save and continue"],leave_question:["Ci sono modifiche non salvate. Come vuoi proseguire?","There are unsaved changes. How do you want to continue?"],setup:["Associazione e attivazione","Binding and activation"],confirm_binding:["Ho verificato dispositivo fisico, blueprint e identificatore eventi.","I have verified the physical device, blueprint and event identifier."],conflict_check:["Ho verificato che non esistono altri gestori attivi per questi eventi.","I have checked that no other active handlers use these events."],enable:["Attiva configurazione","Enable configuration"],disable:["Disattiva configurazione","Disable configuration"],disabled:["Disabilitata","Disabled"],enabled:["Attiva","Enabled"],invalid_form:["Controlla destinatario, funzione e parametri prima di salvare.","Check target, function and parameters before saving."],load_error:["Lettura non riuscita. Riprova.","Could not load. Try again."],no_blueprint:["Blueprint non disponibile: usa l’editor originale per riparare la configurazione.","Blueprint unavailable: use the original editor to repair the configuration."],migration_draft:["Bozza Farhome disabilitata: nessun gestore esterno viene modificato.","Disabled Farhome draft: external handlers are unchanged."],no_options:["Nessuna azione supportata per questo destinatario.","No supported action for this target."],loop:["Ripeti fino al rilascio","Repeat until release"],loop_interval:["Intervallo ripetizione (ms)","Repeat interval (ms)"],empty_list:["Nessun controller rilevato. Puoi aggiungerne uno dal registro dispositivi.","No controllers detected. Add one from the device registry."]};function Ut(t,e){const i=t?.startsWith("it");return e in Rt?Rt[e][i?0:1]:(i?It:Ot)[e]}const jt=n`
  :host{display:block;min-width:0;color:var(--primary-text-color);font:inherit}
  *{box-sizing:border-box}button,input,select{font:inherit;color:inherit;max-width:100%}
  button,a,input,select{touch-action:manipulation}button{min-height:44px;padding:10px 14px;border:1px solid var(--divider-color);border-radius:8px;background:var(--card-background-color);cursor:pointer;text-align:center}
  button:hover:not(:disabled){background:var(--secondary-background-color,var(--primary-background-color))}button:disabled{opacity:.55;cursor:default}
  button.primary{color:var(--text-primary-color,#fff);background:var(--primary-color);border-color:var(--primary-color)}
  :focus-visible{outline:3px solid var(--primary-color);outline-offset:3px}::selection{background:var(--primary-color);color:var(--text-primary-color,#fff)}
  input,select{width:100%;min-width:0;min-height:44px;border:1px solid var(--divider-color);border-radius:6px;padding:10px;background:var(--card-background-color);caret-color:var(--primary-color)}
  input[type=checkbox]{width:20px;min-height:20px;flex:none;accent-color:var(--primary-color)}
  label{display:grid;gap:7px;font-size:14px;min-width:0}label.check{display:flex;align-items:center;gap:10px;line-height:1.5}
  h1,h2,h3,p{margin:0}h1{font-size:26px;font-weight:600}h2{font-size:21px}h3{font-size:16px}p{line-height:1.6;overflow-wrap:anywhere}
  a{color:var(--primary-color);text-underline-offset:3px;overflow-wrap:anywhere}.muted,small{color:var(--secondary-text-color)}small{font-size:13px;line-height:1.5}
  .row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.stack{display:grid;gap:18px}.fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:18px}
  .notice{padding:14px;background:var(--primary-background-color);border:1px solid var(--divider-color);border-radius:8px;line-height:1.6;overflow-wrap:anywhere}
  [role=alert]{color:var(--error-color,#b3261e)}.status{font-size:13px;color:var(--secondary-text-color)}
  .actions{display:flex;gap:10px;flex-wrap:wrap}.dialog-backdrop{position:fixed;inset:0;z-index:10;background:#0008;display:grid;place-items:center;padding:20px}.dialog{width:min(100%,440px);background:var(--card-background-color);padding:24px;border-radius:12px;box-shadow:0 8px 24px #0003;display:grid;gap:22px}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;function Wt(t,e){const i=t.currentTarget;if("Escape"===t.key)return t.preventDefault(),void e();if("Tab"!==t.key)return;const s=Array.from(i.querySelectorAll("button:not(:disabled)")),o=i.getRootNode(),a=s.indexOf(o.activeElement);t.shiftKey&&a<=0?(t.preventDefault(),s.at(-1)?.focus()):t.shiftKey||a!==s.length-1||(t.preventDefault(),s[0]?.focus())}const Ft=["single","restart","queued","parallel"],Zt=["light","fan","switch","scene","script"],Kt=/^(light|fan|switch|scene|script)\.[a-z0-9_]+$/,Qt=t=>!!t&&"object"==typeof t&&!Array.isArray(t),Jt=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),Gt=(t,e,i=1/0)=>"number"==typeof t&&Number.isFinite(t)&&t>=e&&t<=i,Yt=(t,e)=>Object.keys(t).every(t=>e.includes(t));function Xt(t,e){return"scene"===t?"activate"===e?"scene.turn_on":null:"script"===t?"run"===e?"script.turn_on":null:"toggle"===e?`${t}.toggle`:"on"===e||"off"===e?`${t}.turn_${e}`:"light"!==t||"increase"!==e&&"decrease"!==e?"fan"!==t||"increase"!==e&&"decrease"!==e?null:`fan.${e}_speed`:"light.turn_on"}function te(t){if(!(t&&Zt.includes(t.domain)&&Kt.test(t.entity_id)&&t.entity_id.startsWith(t.domain+".")&&Ft.includes(t.mode)))throw new Error("invalid_quick_action");const e=Xt(t.domain,t.kind);if(!e)throw new Error("invalid_quick_action");const i=["domain","kind","entity_id","mode","loop","loop_interval","alias","service_key","data_present"];if("light"===t.domain&&i.push("transition"),"increase"!==t.kind&&"decrease"!==t.kind||i.push("step"),"light"===t.domain&&["on","toggle"].includes(t.kind)&&i.push("brightness_pct","color_temp_kelvin"),"fan"===t.domain&&"on"===t.kind&&i.push("percentage"),!Yt(t,i))throw new Error("invalid_quick_parameters");if(void 0!==t.loop&&"boolean"!=typeof t.loop)throw new Error("invalid_loop");if(!(void 0===t.loop_interval||Gt(t.loop_interval,50,5e3)&&Number.isInteger(t.loop_interval)))throw new Error("invalid_loop_interval");if(void 0!==t.alias&&"string"!=typeof t.alias)throw new Error("invalid_alias");if(void 0!==t.service_key&&!["action","service"].includes(t.service_key))throw new Error("invalid_service_key");if(void 0!==t.data_present&&"boolean"!=typeof t.data_present)throw new Error("invalid_data_flag");const s={};if("increase"===t.kind||"decrease"===t.kind){if("light"===t.domain&&void 0===t.step)throw new Error("missing_step");if(void 0!==t.step){if(!Gt(t.step,Number.MIN_VALUE,100))throw new Error("invalid_step");s["light"===t.domain?"brightness_step_pct":"percentage_step"]="light"===t.domain&&"decrease"===t.kind?-t.step:t.step}}for(const e of["transition","brightness_pct","color_temp_kelvin","percentage"]){const i=t[e];if(void 0!==i){if(!Gt(i,"color_temp_kelvin"===e?Number.MIN_VALUE:0,["brightness_pct","percentage"].includes(e)?100:1/0))throw new Error("invalid_parameter");s[e]=i}}const o={[t.service_key||"action"]:e,target:{entity_id:t.entity_id}};(Object.keys(s).length||t.data_present)&&(o.data=s),void 0!==t.alias&&(o.alias=t.alias);const a={mode:t.mode,sequence:[o]};return void 0!==t.loop&&(a.loop=t.loop),void 0!==t.loop_interval&&(a.loop_interval=t.loop_interval),a}function ee(t){if(!(Qt(t)&&Yt(t,["mode","sequence","loop","loop_interval"])&&Ft.includes(t.mode)&&Array.isArray(t.sequence)&&1===t.sequence.length))return null;const e=t.sequence[0];if(!(Qt(e)&&Yt(e,["action","service","target","data","alias"])&&Jt(e,"action")!==Jt(e,"service")&&Qt(e.target)&&Yt(e.target,["entity_id"])&&"string"==typeof e.target.entity_id&&Kt.test(e.target.entity_id)))return null;const i=Jt(e,"action")?"action":"service",s=e[i],o=e.target.entity_id.split(".")[0];if("string"!=typeof s||!s.startsWith(o+".")||Jt(e,"data")&&!Qt(e.data))return null;const a=e.data||{};let n;const r=s.slice(o.length+1);if("scene"===o&&"turn_on"===r)n="activate";else if("script"===o&&"turn_on"===r)n="run";else if("fan"===o&&["increase_speed","decrease_speed"].includes(r))n="increase_speed"===r?"increase":"decrease";else if("light"===o&&"turn_on"===r&&Jt(a,"brightness_step_pct"))n=a.brightness_step_pct>0?"increase":"decrease";else{if(!["light","fan","switch"].includes(o)||!["toggle","turn_on","turn_off"].includes(r))return null;n="toggle"===r?"toggle":"turn_on"===r?"on":"off"}const l={domain:o,kind:n,entity_id:e.target.entity_id,mode:t.mode,service_key:i};Jt(t,"loop")&&(l.loop=t.loop),Jt(t,"loop_interval")&&(l.loop_interval=t.loop_interval),Jt(e,"alias")&&(l.alias=e.alias),Jt(e,"data")&&(l.data_present=!0);const c=[];if(["increase","decrease"].includes(n)){const t="light"===o?"brightness_step_pct":"percentage_step";if(Jt(a,t)){if("number"!=typeof a[t])return null;l.step="light"===o?Math.abs(a[t]):a[t],c.push(t)}}if("light"===o&&c.push("transition"),"light"===o&&["on","toggle"].includes(n)&&c.push("brightness_pct","color_temp_kelvin"),"fan"===o&&"on"===n&&c.push("percentage"),!Yt(a,c))return null;for(const t of["transition","brightness_pct","color_temp_kelvin","percentage"])Jt(a,t)&&(l[t]=a[t]);try{return te(l),l}catch{return null}}function ie(t){const e=t.attributes.supported_color_modes;return Array.isArray(e)&&e.some(t=>["brightness","color_temp","hs","xy","rgb","rgbw","rgbww","white"].includes(t))}function se(t,e,i=10,s=.1,o="restart"){if(!(/^input_select\.[a-z0-9_]+$/.test(t)&&["next","brightness_up","brightness_down"].includes(e)&&Gt(i,Number.MIN_VALUE,100)&&Gt(s,0,3600)&&Ft.includes(o)))throw new Error("invalid_selector_action");return{mode:o,sequence:"next"===e?[{action:"input_select.select_next",target:{entity_id:t},data:{cycle:!0}}]:[{variables:{farhome_selected_light:`{{ states('${t}') }}`}},{condition:"template",value_template:`{{ farhome_selected_light is string and farhome_selected_light is match('^light[.][a-z0-9_]+$') and farhome_selected_light in (state_attr('${t}', 'options') or []) and has_value(farhome_selected_light) }}`},{action:"light.turn_on",target:{entity_id:"{{ farhome_selected_light }}"},data:{brightness_step_pct:"brightness_up"===e?i:-i,transition:s}}]}}function oe(t){if(!(Qt(t)&&Yt(t,["mode","sequence","loop","loop_interval"])&&Ft.includes(t.mode)&&!0!==t.loop&&Array.isArray(t.sequence)))return null;const e=t.sequence;for(const i of["next","brightness_up","brightness_down"]){let s,o=10,a=.1;if("next"===i)s=e[0]?.target?.entity_id;else{s=/^\{\{ states\('(input_select\.[a-z0-9_]+)'\) \}\}$/.exec(e[0]?.variables?.farhome_selected_light||"")?.[1];const t=e[2]?.data;o=Math.abs(t?.brightness_step_pct),a=t?.transition}if(s)try{const e=se(s,i,o,a,t.mode),n=t=>JSON.stringify(t,(t,e)=>Qt(e)?Object.fromEntries(Object.keys(e).sort().map(t=>[t,e[t]])):e);if(n(e.sequence)===n(t.sequence))return{helper_id:s,kind:i,step:o,transition:a,mode:t.mode}}catch{}}return null}function ae(t,e){if(!t)return[];const i=t.entity_id.split(".")[0];if(!Zt.includes(i))return[];const s="scene"===i?["activate"]:"script"===i?["run"]:["toggle","on","off","increase","decrease"],o=Number(t.attributes.supported_features)||0;return s.filter(s=>{const a=Xt(i,s);if(!a||!e[i]?.[a.split(".")[1]])return!1;if("fan"===i){if(["increase","decrease"].includes(s)&&!(1&o))return!1;if("on"===s&&!(32&o))return!1;if("off"===s&&!(16&o))return!1;if("toggle"===s&&48&~o)return!1}return!("light"===i&&["increase","decrease"].includes(s)&&!ie(t))}).map(t=>({kind:t,label_key:`action_${t}`}))}let ne=class extends rt{constructor(){super(...arguments),this.entityId="",this.configId="",this.allowed=!1,this.options=[],this.active=null,this.initial=null,this.adding="",this.ack=!1,this.dirty=!1,this.busy=!1,this.loading=!1,this.error="",this.applied=!1,this.token=0,this.text=t=>Ut(this.hass?.language,t)}get editable(){return!!this.snapshot?.editable&&this.allowed}get api(){return new Bt(this.hass)}name(t){return String(this.hass.states[t]?.attributes.friendly_name||t)}get hasDirty(){return this.dirty}get saving(){return this.busy}updated(t){(t.has("entityId")||t.has("configId"))&&this.reload()}emitDirty(t){this.dirty=t,this.applied=!1,this.dispatchEvent(new CustomEvent("helper-dirty-changed",{detail:{dirty:t,busy:this.busy},bubbles:!0,composed:!0}))}adopt(t){this.snapshot=t,this.options=[...t.options],this.active=null,this.initial=null,this.ack=!1,this.adding="",this.emitDirty(!1)}discard(){this.snapshot&&this.adopt(this.snapshot)}async reload(){if(!this.entityId||!this.configId)return;const t=++this.token;this.loading=!0,this.error="";try{const e=await this.api.getSelector(this.entityId,this.configId);t===this.token&&this.adopt(e)}catch(e){t===this.token&&(this.error=e.message||this.text("load_error"))}finally{t===this.token&&(this.loading=!1)}}validDraft(){const t=this.snapshot;if(!t)return!1;const e=this.initial??t.initial;return this.options.length>0&&new Set(this.options).size===this.options.length&&this.options.every(t=>/^light\.[a-z0-9_]+$/.test(t)&&!!this.hass.states[t])&&this.options.includes(this.active??t.active)&&(null===e||this.options.includes(e))}move(t,e){const i=[...this.options];[i[t],i[t+e]]=[i[t+e],i[t]],this.options=i,this.emitDirty(!0),this.updateComplete.then(()=>this.renderRoot.querySelector(`[data-option="${i[t+e]}"] [data-direction="${e}"]`)?.focus())}async apply(){if(this.editable&&this.snapshot&&this.validDraft()&&!this.busy&&(this.ack||!(this.snapshot.known_references.length>1))){this.busy=!0,this.error="",this.emitDirty(!0);try{const t=await this.api.updateSelector(this.snapshot,this.configId,this.options,this.active,this.initial,this.ack);this.adopt(t),this.applied=!0}catch(t){this.error=t.message||this.text("load_error")}finally{this.busy=!1,this.dispatchEvent(new CustomEvent("helper-dirty-changed",{detail:{dirty:this.dirty,busy:!1},bubbles:!0,composed:!0}))}}}render(){const t=this.snapshot;return U`<div class="stack">
    ${this.loading?U`<p role="status">${this.text("loading")}</p>`:W}
    ${this.error?U`<p class="notice" role="alert">${this.error}</p>`:W}
    ${t?U`
      <div><h3>${this.text("active_light")}</h3><p>${this.options.includes(t.active)&&"unavailable"!==this.hass.states[t.active]?.state?this.name(t.active):this.text("active_missing")} <small>${t.active}</small></p></div>
      ${this.editable?W:U`<p class="notice">${this.text("yaml_or_unknown"===t.origin?"yaml_readonly":"controller_readonly")}</p>`}
      <h3>${this.text("ordered_lights")}</h3><ol>${this.options.map((t,e)=>U`<li data-option=${t}><div class="light-name"><span>${this.name(t)}</span><small>${t}${this.hass.states[t]&&"unavailable"!==this.hass.states[t].state?"":" · "+this.text("unavailable")}</small></div>${this.editable?U`<div class="list-actions"><button data-direction="-1" aria-label=${this.text("up")+" "+this.name(t)} ?disabled=${this.busy||0===e} @click=${()=>this.move(e,-1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 14 6-6 6 6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><button data-direction="1" aria-label=${this.text("down")+" "+this.name(t)} ?disabled=${this.busy||e===this.options.length-1} @click=${()=>this.move(e,1)}><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="m6 10 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></button><button aria-label=${this.text("remove")+" "+this.name(t)} ?disabled=${this.busy} @click=${()=>{this.options=this.options.filter(e=>e!==t),this.emitDirty(!0)}}>${this.text("remove")}</button></div>`:W}</li>`)}</ol>
      ${this.editable?U`
        <div class="fields"><label>${this.text("light_to_add")}<select aria-label=${this.text("light_to_add")} ?disabled=${this.busy} @change=${t=>this.adding=t.target.value}><option value="" .selected=${!this.adding}>${this.text("choose")}</option>${Object.keys(this.hass.states).filter(t=>/^light\.[a-z0-9_]+$/.test(t)&&!this.options.includes(t)).sort((t,e)=>this.name(t).localeCompare(this.name(e),this.hass.language)).map(t=>U`<option value=${t} .selected=${this.adding===t}>${this.name(t)}</option>`)}</select></label><button ?disabled=${this.busy||!this.adding||this.options.includes(this.adding)} @click=${()=>{this.adding&&!this.options.includes(this.adding)&&(this.options=[...this.options,this.adding],this.adding="",this.emitDirty(!0))}}>${this.text("add_light")}</button></div>
        <div class="fields">${["active","initial"].map(e=>{const i=("active"===e?this.active:this.initial)??t[e];return U`<label>${this.text("active"===e?"active_light":"initial_light")}<select aria-label=${this.text("active"===e?"active_light":"initial_light")} ?disabled=${this.busy} @change=${t=>{const i=t.target.value;"active"===e?this.active=i||null:this.initial=i||null,this.emitDirty(!0)}}><option value="" .selected=${null===i||!this.options.includes(i)}>${this.text("initial"===e&&null===i?"no_initial":"choose")}</option>${this.options.map(t=>U`<option value=${t} .selected=${i===t}>${this.name(t)}</option>`)}</select></label>`})}</div>
        ${this.validDraft()?W:U`<p class="notice">${this.text("list_invalid")}</p>`}
      `:W}
      <details><summary>${this.text("known_dependencies")} · ${t.known_references.length}</summary><p class="muted">${this.text("dependencies_notice")}</p><ul>${t.known_references.map(t=>U`<li>${t.type} · ${t.id}</li>`)}</ul></details>
      ${this.editable&&t.known_references.length>1?U`<label class="check"><input type="checkbox" .checked=${this.ack} ?disabled=${this.busy} @change=${t=>this.ack=t.target.checked}>${this.text("dependencies_ack")}</label>`:W}
    `:W}
    <div class="actions">${this.editable?U`<button ?disabled=${this.busy||!this.dirty||!this.validDraft()||!this.ack&&t.known_references.length>1} @click=${this.apply}>${this.text("apply_list")}</button><button ?disabled=${this.busy||!this.dirty} @click=${this.discard}>${this.text("cancel")}</button>`:W}<button ?disabled=${this.busy||this.loading} @click=${this.reload}>${this.text("reload_list")}</button></div>
    <span role="status">${this.applied?this.text("list_applied"):this.dirty?this.text("dirty"):""}</span>
  </div>`}static{this.styles=[jt,n`
    ol{margin:0;padding:0;list-style-position:inside}ol li{display:flex;align-items:center;gap:12px;border-top:1px solid var(--divider-color);padding:12px 0}.light-name{display:grid;gap:4px;min-width:0;flex:1;overflow-wrap:anywhere}.list-actions{display:flex;gap:6px}.list-actions button{padding:8px 10px;font-size:13px}.fields{align-items:end}details{font-size:13px}summary{cursor:pointer;min-height:44px;padding:10px 0}ul{padding-left:20px;overflow-wrap:anywhere}@media(max-width:500px){ol li{flex-wrap:wrap}.light-name{flex-basis:100%}.list-actions{margin-left:auto}}
  `]}};t([pt({attribute:!1})],ne.prototype,"hass",void 0),t([pt()],ne.prototype,"entityId",void 0),t([pt()],ne.prototype,"configId",void 0),t([pt({type:Boolean})],ne.prototype,"allowed",void 0),t([ut()],ne.prototype,"snapshot",void 0),t([ut()],ne.prototype,"options",void 0),t([ut()],ne.prototype,"active",void 0),t([ut()],ne.prototype,"initial",void 0),t([ut()],ne.prototype,"adding",void 0),t([ut()],ne.prototype,"ack",void 0),t([ut()],ne.prototype,"dirty",void 0),t([ut()],ne.prototype,"busy",void 0),t([ut()],ne.prototype,"loading",void 0),t([ut()],ne.prototype,"error",void 0),t([ut()],ne.prototype,"applied",void 0),ne=t([ct("farhome-selector-editor")],ne);let re=class extends rt{constructor(){super(...arguments),this.asset=null,this.large=!1,this.failed=!1}willUpdate(t){t.has("asset")&&(this.failed=!1)}render(){const t=this.asset?.url;return t&&(/^https:\/\//.test(t)||/^\/assets\/switch_manager\//.test(t))&&!this.failed?U`<img src=${t} alt="" loading="lazy" referrerpolicy="no-referrer" @error=${()=>this.failed=!0}>`:U`<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="9" y="6" width="30" height="36" rx="6"/><circle cx="24" cy="24" r="8"/><path d="M24 19v10"/></svg>`}static{this.styles=n`:host{display:grid;place-items:center;width:56px;height:56px;flex:none}:host([large]){width:80px;height:80px}img{width:100%;height:100%;object-fit:contain}svg{width:42px;height:42px;fill:none;stroke:var(--secondary-text-color);stroke-width:2}`}};t([pt({attribute:!1})],re.prototype,"asset",void 0),t([pt({type:Boolean,reflect:!0})],re.prototype,"large",void 0),t([ut()],re.prototype,"failed",void 0),re=t([ct("farhome-thumbnail")],re);let le=class extends rt{constructor(){super(...arguments),this.narrow=!1,this.loading=!1,this.busy=!1,this.error="",this.saved=!1,this.dirty=!1,this.selected="0:0",this.pickedConfig="",this.blueprints={},this.newBlueprint="",this.newIdentifier="",this.newName="",this.preparing=!1,this.showAdvanced=!1,this.replacePending=!1,this.conflictChecked=!1,this.helperChoice="",this.helperDirty=!1,this.helperBusy=!1,this.selectorPending=!1,this.selectorKind="next",this.selectorStep=10,this.selectorTransition=.1,this.quick=new Map,this.selectors=new Map,this.token=0,this.text=t=>Ut(this.hass?.language,t)}get api(){return new Bt(this.hass)}get hasDirty(){return this.dirty||this.helperDirty}get hasHelperDirty(){return this.helperDirty}get saving(){return this.busy||this.helperBusy}get readonly(){return"external"===this.controller.management&&!this.preparing}get blueprint(){return"object"==typeof this.draft?.blueprint?this.draft.blueprint:void 0}get indices(){return this.selected.split(":").map(Number)}get action(){const[t,e]=this.indices;return this.draft?.buttons[t]?.actions[e]}get currentQuick(){return this.quick.get(this.selected)||(this.action?ee(this.action):null)}updated(t){t.has("controller")&&t.get("controller")?.device_id!==this.controller.device_id&&this.openController(),t.has("replacePending")&&this.replacePending&&this.renderRoot.querySelector("[role=dialog] button:last-child")?.focus()}async openController(){this.token++,this.envelope=void 0,this.draft=void 0,this.binding=void 0,this.error="",this.saved=!1,this.preparing=!1,this.pickedConfig="",this.helperDirty=!1,this.helperBusy=!1,this.helperChoice="",this.quick.clear(),this.selectors.clear(),this.markDirty(!1),1===this.controller.config_ids.length?(this.pickedConfig=this.controller.config_ids[0],await this.load(this.pickedConfig)):this.controller.config_ids.length||await this.loadBlueprints()}async loadBlueprints(){try{const t=await this.hass.callWS({type:"switch_manager/blueprints"});this.blueprints=t.blueprints}catch(t){this.error=this.message(t)}}message(t){const e=t;return e?.message||e?.code||this.text("load_error")}adopt(t){this.envelope=t,this.draft=structuredClone(t.config),this.binding={...t.metadata||{device_id:this.controller.device_id}},this.quick.clear(),this.selectors.clear(),this.markDirty(!1),this.conflictChecked=!1,this.selected="0:0",this.showAdvanced=!1}async load(t){const e=++this.token;this.loading=!0,this.error="";try{const i=await this.api.get(t);e===this.token&&this.adopt(i)}catch(t){e===this.token&&(this.error=this.message(t))}finally{e===this.token&&(this.loading=!1)}}emitDirty(){this.dispatchEvent(new CustomEvent("dirty-changed",{detail:{dirty:this.hasDirty},bubbles:!0,composed:!0}))}markDirty(t=!0){this.dirty=t,this.saved=!1,this.emitDirty()}changed(){this.draft={...this.draft},this.markDirty()}setQuick(t){this.quick.set(this.selected,t),this.selectors.delete(this.selected);try{const[e,i]=this.indices;this.draft.buttons[e].actions[i]=te(t),this.error=""}catch{this.error=this.text("invalid_form")}this.showAdvanced=!1,this.changed()}useQuick(){!this.action?.sequence.length||ee(this.action)?this.replaceWithQuick():this.replacePending=!0}replaceWithQuick(){this.replacePending=!1;const t=Object.values(this.hass.states).find(t=>ae(t,this.hass.services).length),e=t?.entity_id.split(".")[0]||"light";this.setQuick({domain:e,entity_id:t?.entity_id||"",kind:t?ae(t,this.hass.services)[0].kind:"on",mode:this.action?.mode||"restart"})}changeTarget(t,e){const i=ae(this.hass.states[e],this.hass.services),s=i.some(e=>e.kind===t.kind)?t.kind:i[0]?.kind||"on";this.setQuick({domain:e.split(".")[0],entity_id:e,kind:s,mode:t.mode,...["increase","decrease"].includes(s)?{step:10}:{}})}selectDomain(t,e){const i=Object.values(this.hass.states).find(t=>t.entity_id.startsWith(e+".")&&ae(t,this.hass.services).length);i?this.changeTarget(t,i.entity_id):this.setQuick({domain:e,entity_id:"",kind:"scene"===e?"activate":"script"===e?"run":"on",mode:t.mode})}changeKind(t,e){this.setQuick({domain:t.domain,entity_id:t.entity_id,mode:t.mode,kind:e,...["increase","decrease"].includes(e)?{step:10}:{}})}advancedChanged(t){if(this.busy||this.readonly||!Array.isArray(t.detail.value))return;const[e,i]=this.indices;this.draft.buttons[e].actions[i]={...this.action,sequence:structuredClone(t.detail.value)},this.quick.delete(this.selected),this.selectors.delete(this.selected),this.changed()}numeric(t,e,i,s,o,a=!1){return U`<label>${this.text(t)}<input type="number" min=${s} max=${o??W} step="any" .value=${String(i[e]??"")} ?required=${!a} ?disabled=${this.busy||this.readonly} @input=${t=>{const s=t.target,o={...i};a&&!s.value?delete o[e]:o[e]=s.valueAsNumber,this.setQuick(o)}}></label>`}quickForm(t){const e=this.hass.states[t.entity_id],i=ae(e,this.hass.services);return U`<div class="fields">
      <label>${this.text("target_type")}<select aria-label=${this.text("target_type")} ?disabled=${this.busy||this.readonly} @change=${e=>this.selectDomain(t,e.target.value)}>${["light","fan","switch","scene","script"].map(e=>U`<option value=${e} .selected=${e===t.domain}>${this.text(e)}</option>`)}</select></label>
      <label>${this.text("target")}<select aria-label=${this.text("target")} ?disabled=${this.busy||this.readonly} @change=${e=>this.changeTarget(t,e.target.value)}><option value="" .selected=${!t.entity_id}>${this.text("choose")}</option>${!e&&t.entity_id?U`<option value=${t.entity_id} .selected=${!0}>${t.entity_id} · ${this.text("unavailable")}</option>`:W}${Object.values(this.hass.states).filter(e=>e.entity_id.startsWith(t.domain+".")).sort((t,e)=>String(t.attributes.friendly_name||t.entity_id).localeCompare(String(e.attributes.friendly_name||e.entity_id),this.hass.language)).map(e=>U`<option value=${e.entity_id} .selected=${e.entity_id===t.entity_id}>${e.attributes.friendly_name||e.entity_id}${"unavailable"===e.state?" · "+this.text("unavailable"):""}</option>`)}</select></label>
      <label>${this.text("function")}<select aria-label=${this.text("function")} ?disabled=${this.busy||this.readonly||!i.length} @change=${e=>this.changeKind(t,e.target.value)}>${i.some(e=>e.kind===t.kind)?W:U`<option value=${t.kind} .selected=${!0}>${this.text("action_"+t.kind)} · ${this.text("unavailable")}</option>`}${i.map(e=>U`<option value=${e.kind} .selected=${e.kind===t.kind}>${this.text(e.label_key)}</option>`)}</select></label>
      ${["increase","decrease"].includes(t.kind)?this.numeric("fan"===t.domain?"step_speed":"step_brightness","step",t,.1,100):W}
      ${"light"===t.domain?this.numeric("transition","transition",t,0,3600,!0):W}
      ${"light"===t.domain&&["on","toggle"].includes(t.kind)&&e&&ie(e)?this.numeric("brightness","brightness_pct",t,0,100,!0):W}
      ${"light"===t.domain&&["on","toggle"].includes(t.kind)&&e?.attributes.supported_color_modes?.includes("color_temp")?this.numeric("kelvin","color_temp_kelvin",t,e.attributes.min_color_temp_kelvin||1,e.attributes.max_color_temp_kelvin,!0):W}
      ${"fan"===t.domain&&"on"===t.kind&&1&Number(e?.attributes.supported_features)?this.numeric("percentage","percentage",t,0,100,!0):W}
    </div>${i.length?W:U`<p class="notice">${this.text("no_options")}</p>`}`}async prepare(){this.preparing=!0,this.error="",this.draft?(this.draft={...structuredClone(this.draft),id:null,enabled:!1,name:this.draft.name+" Farhome"},this.envelope=void 0,this.binding={device_id:this.controller.device_id,verified:!1},this.markDirty()):await this.loadBlueprints()}async createDraft(){const t=this.blueprints[this.newBlueprint];t&&this.newIdentifier.trim()&&this.newName.trim()?(this.draft={...wt(t),id:null,name:this.newName,identifier:this.newIdentifier,enabled:!1},this.binding={device_id:this.controller.device_id,verified:!1},this.preparing=!0,this.markDirty()):this.error=this.text("invalid_form")}async save(t=!1){if(t&&this.helperDirty)return this.error=this.text("helper_draft_pending"),!1;if(this.busy||!this.draft||this.readonly)return!1;const e=this.renderRoot.querySelectorAll("input");for(const t of e)if(!t.reportValidity())return!1;this.busy=!0,this.error="";try{const t=Array.from(this.quick,([t,e])=>{te(e);const[i,s]=t.split(":").map(Number);return{button:i,action:s,value:e}}),e=await this.api.save(structuredClone(this.draft),this.binding,this.envelope?.revision,t,Array.from(this.selectors.values())),i=this.selected;return this.adopt(e),this.selected=i,this.saved=!0,this.dispatchEvent(new CustomEvent("save",{detail:e,bubbles:!0,composed:!0})),!0}catch(t){return this.error=this.message(t),!1}finally{this.busy=!1}}discard(){this.renderRoot.querySelector("farhome-selector-editor")?.discard(),this.helperDirty=!1,this.envelope?this.adopt(this.envelope):(this.draft=void 0,this.markDirty(!1)),this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}async toggle(){if(this.envelope&&!this.dirty&&!this.busy){this.busy=!0,this.error="";try{const t=await this.api.setEnabled(this.envelope.config_id,!this.draft.enabled,this.envelope.revision,this.conflictChecked);this.adopt(t),this.dispatchEvent(new CustomEvent("save",{detail:t,bubbles:!0,composed:!0}))}catch(t){this.error=this.message(t)}finally{this.busy=!1}}}get canLinkHelper(){return!(!this.envelope||!this.draft?.enabled||!this.binding?.verified||!this.binding?.conflicts_checked||this.readonly)}selectorSection(){if(this.readonly)return W;const t=this.binding?.selector_helper;return U`<details open=${!!t||W}><summary>${this.text("selector")}</summary><div class="stack setup">
      ${this.canLinkHelper?U`<label>${this.text("helper")}<select aria-label=${this.text("helper")} ?disabled=${this.busy||this.helperDirty||this.helperBusy} @change=${t=>this.helperChoice=t.target.value}><option value="">${this.text("choose")}</option>${Object.keys(this.hass.states).filter(t=>/^input_select\.[a-z0-9_]+$/.test(t)).map(e=>U`<option value=${e} .selected=${e===(this.helperChoice||t)}>${this.hass.states[e].attributes.friendly_name||e}</option>`)}</select></label><button ?disabled=${this.busy||this.helperDirty||this.helperBusy||!this.helperChoice||t===this.helperChoice} @click=${()=>{this.binding={...this.binding,selector_helper:this.helperChoice},this.changed()}}>${this.text("link_helper")}</button>`:U`<p class="muted">${this.text("helper_migration")}</p>`}
      ${t!==this.envelope?.metadata?.selector_helper?U`<p class="notice">${this.text("helper_pending")}</p>`:W}
      ${t&&this.envelope?U`<farhome-selector-editor .hass=${this.hass} .entityId=${t} .configId=${this.envelope.config_id} .allowed=${this.canLinkHelper&&!this.busy&&t===this.envelope.metadata?.selector_helper} @helper-dirty-changed=${t=>{this.helperDirty=t.detail.dirty,this.helperBusy=t.detail.busy,this.emitDirty()}}></farhome-selector-editor>`:W}
    </div></details>`}applySelector(){const t=this.binding?.selector_helper;if(t&&this.action)try{const[e,i]=this.indices,s={button:e,action:i,kind:this.selectorKind,step:this.selectorStep,transition:this.selectorTransition,mode:this.action.mode},o=se(t,s.kind,s.step,s.transition,s.mode);this.draft.buttons[e].actions[i]=o,this.quick.delete(this.selected),this.selectors.set(this.selected,s),this.selectorPending=!1,this.showAdvanced=!1,this.changed()}catch{this.error=this.text("invalid_form")}}selectorGesture(){const t=this.binding?.selector_helper;if(!t||this.readonly||!this.action)return W;const e=oe(this.action);return U`${e?U`<p class="notice">${this.text("selector")} · ${e.helper_id} · ${this.text("next"===e.kind?"next_light":"brightness_up"===e.kind?"dim_up":"dim_down")}</p>`:W}
      <button ?disabled=${this.busy} @click=${()=>{this.selectorKind=e?.kind||"next",this.selectorStep=e?.step??10,this.selectorTransition=e?.transition??.1,this.selectorPending=!this.selectorPending}}>${this.text("use_selector")}</button>
      ${this.selectorPending?U`<div class="notice stack"><p>${this.text("selector_summary")}</p><label>${this.text("selector_function")}<select aria-label=${this.text("selector_function")} @change=${t=>this.selectorKind=t.target.value}>${["next","brightness_up","brightness_down"].map(t=>U`<option value=${t} .selected=${t===this.selectorKind}>${this.text("next"===t?"next_light":"brightness_up"===t?"dim_up":"dim_down")}</option>`)}</select></label>${"next"!==this.selectorKind?U`<div class="fields"><label>${this.text("step_brightness")}<input type="number" min="0.1" max="100" step="any" .value=${String(this.selectorStep)} @input=${t=>this.selectorStep=t.target.valueAsNumber}></label><label>${this.text("transition")}<input type="number" min="0" max="3600" step="any" .value=${String(this.selectorTransition)} @input=${t=>this.selectorTransition=t.target.valueAsNumber}></label></div>`:W}<button @click=${this.applySelector}>${this.text("confirm_selector")}</button></div>`:W}`}render(){if(!this.controller)return W;const t=this.blueprint,e=this.action,i=this.currentQuick,s=e&&oe(e);return U`<section class="stack" aria-label=${this.controller.name}>
      <header class="device-heading"><farhome-thumbnail large .asset=${this.controller.image}></farhome-thumbnail><div><h2>${this.controller.name}</h2><p class="muted">${this.controller.manufacturer} ${this.controller.model}</p><p class="status">${this.text("farhome"===this.controller.management?"managed":"external"===this.controller.management?"external":"unknown")} · ${this.text("verified"===this.controller.compatibility?"verified":"unverified")}</p></div></header>
      ${this.error?U`<div class="notice" role="alert">${this.error}${this.draft?W:U` <button @click=${()=>this.pickedConfig?this.load(this.pickedConfig):this.loadBlueprints()}>${this.text("retry")}</button>`}</div>`:W}
      ${this.loading?U`<p role="status">${this.text("loading")}</p>`:W}
      ${this.controller.config_ids.length>1?U`<label>${this.text("configuration")}<select .value=${this.pickedConfig} ?disabled=${this.dirty||this.busy} @change=${t=>{this.pickedConfig=t.target.value,this.pickedConfig&&this.load(this.pickedConfig)}}><option value="">${this.text("choose_configuration")}</option>${this.controller.config_ids.map(t=>U`<option value=${t}>${t}</option>`)}</select></label>`:W}
      ${this.readonly?U`<p class="notice">${this.text("external_notice")}</p><button ?disabled=${this.busy||this.loading} @click=${this.prepare}>${this.text("prepare")}</button>`:W}
      ${this.draft||this.loading||this.readonly||this.controller.config_ids.length&&!this.preparing?W:U`<form class="stack" @submit=${t=>{t.preventDefault(),this.createDraft()}}><p>${this.text("no_config")}</p><label>${this.text("name")}<input required maxlength="255" .value=${this.newName} @input=${t=>{this.newName=t.target.value,this.markDirty()}}></label><label>${this.text("blueprint")}<select required .value=${this.newBlueprint} @change=${t=>{this.newBlueprint=t.target.value,this.markDirty()}}><option value="">${this.text("choose")}</option>${Object.values(this.blueprints).sort((t,e)=>t.name.localeCompare(e.name,this.hass.language)).map(t=>U`<option value=${t.id}>${t.service} · ${t.name}</option>`)}</select></label><label>${this.text("identifier")}<input required maxlength="1024" .value=${this.newIdentifier} @input=${t=>{this.newIdentifier=t.target.value,this.markDirty()}}></label><button type="submit">${this.text("create_draft")}</button></form>`}
      ${this.draft?U`
        ${t?U`
          <div class="gesture-tabs" role="group" aria-label=${this.text("gestures")}>${t.buttons.flatMap((e,i)=>e.actions.map((e,s)=>{const o=`${i}:${s}`;return U`<button data-gesture=${o} aria-pressed=${o===this.selected} ?disabled=${this.busy} @click=${()=>{this.selected=o,this.showAdvanced=!1}}>${t.buttons.length>1?`${this.text("button")} ${i+1} · `:""}${e.title}</button>`}))}</div>
          ${e?U`<div class="gesture-editor stack"><h3>${t.buttons[this.indices[0]].actions[this.indices[1]].title}</h3>
            ${i&&!this.showAdvanced?this.quickForm(i):s&&!this.showAdvanced?W:U`<p>${this.text(e.sequence.length?"advanced":"no_action")}</p>${e.sequence.length?U`<p class="muted">${this.text("advanced_notice")}</p>`:W}`}
            ${this.selectorGesture()}
            <div class="actions">${this.readonly?W:U`<button @click=${this.useQuick} ?disabled=${this.busy}>${this.text("configure_quick")}</button>`}<button @click=${()=>this.showAdvanced=!this.showAdvanced} ?disabled=${this.busy}>${this.text("other_actions")}</button></div>
            ${this.showAdvanced?U`<ha-automation-action .hass=${this.hass} .actions=${e.sequence} .disabled=${this.busy||this.readonly} .narrow=${this.narrow} @value-changed=${this.advancedChanged}></ha-automation-action>`:W}
            <label>${this.text("mode")}<select aria-label=${this.text("mode")} ?disabled=${this.busy||this.readonly} @change=${t=>{e.mode=t.target.value,i&&this.quick.set(this.selected,{...i,mode:e.mode});const s=this.selectors.get(this.selected);s&&this.selectors.set(this.selected,{...s,mode:e.mode}),this.changed()}}>${["single","restart","queued","parallel"].map(t=>U`<option .selected=${t===e.mode}>${t}</option>`)}</select></label>
            ${null!=t.buttons[this.indices[0]].actions[this.indices[1]].release_index?U`<label class="check"><input type="checkbox" .checked=${!!e.loop} ?disabled=${this.busy||this.readonly} @change=${t=>{e.loop=t.target.checked,i&&this.quick.set(this.selected,{...i,loop:e.loop}),this.changed()}}>${this.text("loop")}</label>${e.loop?U`<label>${this.text("loop_interval")}<input type="number" min="50" max="5000" step="1" .value=${String(e.loop_interval??250)} ?disabled=${this.busy||this.readonly} @input=${t=>{e.loop_interval=t.target.valueAsNumber,i&&this.quick.set(this.selected,{...i,loop_interval:e.loop_interval}),this.changed()}}></label>`:W}`:W}
          </div>`:W}`:U`<p class="notice">${this.text("no_blueprint")}</p>`}
        ${this.selectorSection()}
        ${this.readonly?W:U`<details><summary>${this.text("setup")}</summary><div class="stack setup"><label>${this.text("name")}<input .value=${this.draft.name} maxlength="255" required ?disabled=${this.busy} @input=${t=>{this.draft.name=t.target.value,this.changed()}}></label><label>${this.text("identifier")}<input .value=${this.draft.identifier} maxlength="1024" required ?disabled=${this.busy} @input=${t=>{this.draft.identifier=t.target.value,this.changed()}}></label><label class="check"><input type="checkbox" .checked=${!!this.binding?.verified} ?disabled=${this.busy} @change=${t=>{this.binding={...this.binding,verified:t.target.checked},this.changed()}}>${this.text("confirm_binding")}</label><p class="status">${this.text(this.draft.enabled?"enabled":"disabled")}</p><label class="check"><input type="checkbox" .checked=${this.conflictChecked} ?disabled=${this.busy||this.dirty} @change=${t=>this.conflictChecked=t.target.checked}>${this.text("conflict_check")}</label><button ?disabled=${this.busy||this.dirty||!this.envelope||!this.draft.enabled&&!this.conflictChecked} @click=${this.toggle}>${this.text(this.draft.enabled?"disable":"enable")}</button></div></details>
        <footer class="row"><button class="primary" ?disabled=${this.busy||!this.dirty||!t} @click=${()=>this.save()}>${this.text("save")}</button><button ?disabled=${this.busy||!this.dirty} @click=${this.discard}>${this.text("cancel")}</button><span role="status">${this.text(this.busy?"saving":this.saved?"saved":this.dirty?"dirty":this.draft.enabled?"enabled":"disabled")}</span></footer>`}
      `:W}
      ${this.replacePending?U`<div class="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-label=${this.text("replace")} @keydown=${t=>Wt(t,()=>this.replacePending=!1)}><p>${this.text("replace_advanced")}</p><div class="actions"><button @click=${this.replaceWithQuick}>${this.text("replace")}</button><button @click=${()=>this.replacePending=!1}>${this.text("cancel")}</button></div></div></div>`:W}
    </section>`}static{this.styles=[jt,n`
    section{padding:28px}.device-heading{display:flex;align-items:center;gap:20px;min-width:0}.device-heading>div{min-width:0}h2{overflow-wrap:anywhere;line-height:1.4}.gesture-tabs{display:flex;gap:8px;flex-wrap:wrap;border-bottom:1px solid var(--divider-color);padding:0 0 20px}.gesture-tabs button{font-size:13px;text-align:left}.gesture-tabs [aria-pressed=true]{color:var(--primary-color);border-color:var(--primary-color);font-weight:600}.gesture-editor{padding-block:4px 16px}footer{border-top:1px solid var(--divider-color);padding-top:20px}details{border-top:1px solid var(--divider-color);padding-top:20px}summary{cursor:pointer;min-height:44px;padding:10px 0}.setup{padding-top:12px}ha-automation-action{min-width:0}@media(max-width:600px){section{padding:20px 16px}.device-heading{align-items:flex-start;gap:12px}.device-heading h2{font-size:20px}farhome-thumbnail[large]{width:64px;height:64px}}
  `]}};t([pt({attribute:!1})],le.prototype,"hass",void 0),t([pt({attribute:!1})],le.prototype,"controller",void 0),t([pt({attribute:!1})],le.prototype,"route",void 0),t([pt({type:Boolean})],le.prototype,"narrow",void 0),t([ut()],le.prototype,"envelope",void 0),t([ut()],le.prototype,"draft",void 0),t([ut()],le.prototype,"binding",void 0),t([ut()],le.prototype,"loading",void 0),t([ut()],le.prototype,"busy",void 0),t([ut()],le.prototype,"error",void 0),t([ut()],le.prototype,"saved",void 0),t([ut()],le.prototype,"dirty",void 0),t([ut()],le.prototype,"selected",void 0),t([ut()],le.prototype,"pickedConfig",void 0),t([ut()],le.prototype,"blueprints",void 0),t([ut()],le.prototype,"newBlueprint",void 0),t([ut()],le.prototype,"newIdentifier",void 0),t([ut()],le.prototype,"newName",void 0),t([ut()],le.prototype,"preparing",void 0),t([ut()],le.prototype,"showAdvanced",void 0),t([ut()],le.prototype,"replacePending",void 0),t([ut()],le.prototype,"conflictChecked",void 0),t([ut()],le.prototype,"helperChoice",void 0),t([ut()],le.prototype,"helperDirty",void 0),t([ut()],le.prototype,"helperBusy",void 0),t([ut()],le.prototype,"selectorPending",void 0),t([ut()],le.prototype,"selectorKind",void 0),t([ut()],le.prototype,"selectorStep",void 0),t([ut()],le.prototype,"selectorTransition",void 0),le=t([ct("farhome-device-editor")],le);const ce="_no_area",de="_unassociated";let he=class extends rt{constructor(){super(...arguments),this.narrow=!1,this.loading=!1,this.error="",this.path="",this.pending="",this.dirty=!1,this.add=!1,this.adding="",this.mutation=!1,this.associations=new Map,this.text=t=>Ut(this.hass?.language,t),this.beforeUnload=t=>{this.dirty&&(t.preventDefault(),t.returnValue="")}}connectedCallback(){super.connectedCallback(),window.addEventListener("beforeunload",this.beforeUnload)}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("beforeunload",this.beforeUnload)}firstUpdated(){this.path=this.route?.path||"",this.refresh()}updated(t){t.has("route")&&this.snapshot&&this.route?.path!==this.path&&this.navigate(this.route?.path||"",!0),t.has("pending")&&this.pending&&this.renderRoot.querySelector("[role=dialog] button:last-child")?.focus()}allowRoute(t){return!this.dirty&&!this.editor?.saving||(this.pending=t,!1)}get api(){return new Bt(this.hass)}get parts(){return this.path.split("/").filter(Boolean).map(t=>{try{return decodeURIComponent(t)}catch{return t}})}get area(){return this.parts[1]||this.snapshot?.areas[0]?.id||ce}get deviceId(){return"device"===this.parts[2]?this.parts[3]:void 0}roomPath(t){return`/rooms/${encodeURIComponent(t)}`}async refresh(){this.loading=!0,this.error="";try{this.snapshot=await this.api.snapshot()}catch(t){this.error=t.message||this.text("load_error")}finally{this.loading=!1}}commitPath(t,e=!1){this.path=t,this.pending="",this.dirty=!1,e||(history.pushState(null,"","/switch_manager"+t),window.dispatchEvent(new CustomEvent("location-changed")))}navigate(t,e=!1){if(t!==this.path){if(!this.dirty&&!this.editor?.saving)return"/legacy"===t?(history.pushState(null,"","/switch_manager/legacy"),void window.dispatchEvent(new CustomEvent("location-changed"))):void this.commitPath(t,e);this.pending=t}}stay(){this.pending="",history.replaceState(null,"","/switch_manager"+this.path),window.dispatchEvent(new CustomEvent("location-changed"))}leave(){this.editor?.discard();const t=this.pending;this.commitPath(t)}async saveLeave(){if(await(this.editor?.save(!0))){const t=this.pending;this.commitPath(t)}}async metadata(t){if(this.snapshot&&!this.mutation){this.mutation=!0,this.error="";try{await this.api.saveMetadata(t,this.snapshot.metadata_revision),await this.refresh(),this.add=!1,this.adding=""}catch(t){this.error=t.message||this.text("load_error")}finally{this.mutation=!1}}}group(t){const e=[...t].sort((t,e)=>t.manufacturer.localeCompare(e.manufacturer,this.hass.language)||t.model.localeCompare(e.model,this.hass.language)||t.name.localeCompare(e.name,this.hass.language)),i=new Map;for(const t of e){const e=[t.manufacturer,t.model].filter(Boolean).join(" · ")||this.text("unknown");i.set(e,[...i.get(e)||[],t])}return Array.from(i)}deviceRow(t){return U`<button class="device" data-device=${t.device_id} aria-pressed=${t.device_id===this.deviceId} @click=${()=>this.navigate(`${this.roomPath(this.area)}/device/${encodeURIComponent(t.device_id)}`)}><farhome-thumbnail .asset=${t.image}></farhome-thumbnail><span class="device-copy"><strong>${t.name}</strong><small>${this.text("farhome"===t.management?"managed":"external"===t.management?"external":"unknown")}</small><small>${this.text("verified"===t.compatibility?"verified":"unverified")} · ${t.config_ids.length} ${this.text("configuration").toLocaleLowerCase(this.hass.language)}</small></span></button>`}render(){const t=this.snapshot,e=t?.controllers.find(t=>t.device_id===this.deviceId),i=t?.controllers.filter(t=>(t.area_id||ce)===this.area)||[],s=this.area===ce?this.text("no_room"):this.area===de?this.text("unassociated"):t?.areas.find(t=>t.id===this.area)?.name||this.text("rooms"),o=[...t?.areas||[],{id:ce,name:this.text("no_room")},{id:de,name:this.text("unassociated")}];return U`<main class=${e?"has-device":""}>
      <header class="top"><ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button><h1>${this.text("title")}</h1><button class="legacy" @click=${()=>this.navigate("/legacy")}>${this.text("legacy")}</button></header>
      ${this.error?U`<div class="notice global-error" role="alert">${this.error} <button @click=${this.refresh}>${this.text("retry")}</button></div>`:W}
      ${!t&&this.loading?U`<p class="placeholder" role="status">${this.text("loading")}</p>`:W}
      ${t?U`<nav aria-label=${this.text("rooms")}>${o.map(t=>U`<button aria-current=${t.id===this.area?"page":W} @click=${()=>this.navigate(this.roomPath(t.id))}>${t.name}</button>`)}</nav>
        ${t.warnings.length?U`<p class="warnings muted">${t.warnings.join(" · ")}</p>`:W}
        <div class="workspace"><section class="inventory" aria-label=${s}><div class="room-heading"><h2>${s}</h2><button @click=${()=>this.add=!this.add}>${this.text("add_button")}</button></div>
          ${this.add?U`<form class="stack manual" @submit=${e=>{e.preventDefault(),this.adding&&this.metadata({controllers:{[this.adding]:{...t.metadata.controllers[this.adding],manual:!0}}})}}><label>${this.text("registered_device")}<select required .value=${this.adding} @change=${t=>this.adding=t.target.value}><option value="">${this.text("choose")}</option>${t.available_devices.map(t=>U`<option value=${t.id}>${t.name_by_user||t.name||t.id} · ${t.model||""}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation||!this.adding}>${this.text("add_to_list")}</button></form>`:W}
          ${this.area===de?U`${t.unassociated_configs.length?t.unassociated_configs.map(e=>U`<form class="stack unassociated" @submit=${i=>{i.preventDefault();const s=this.associations.get(e.config_id);s&&this.metadata({bindings:{[e.config_id]:{...t.metadata.bindings[e.config_id],device_id:s,verified:!1,conflicts_checked:!1}}})}}><h3>${e.name}</h3><label>${this.text("associate_device")}<select required @change=${t=>this.associations.set(e.config_id,t.target.value)}><option value="">${this.text("choose")}</option>${t.controllers.map(t=>U`<option value=${t.device_id}>${t.name}</option>`)}</select></label><button type="submit" ?disabled=${this.mutation}>${this.text("link_config")}</button></form>`):U`<p class="placeholder">${this.text("no_unassociated")}</p>`}`:U`${this.group(i).map(([t,e])=>U`<section class="model-group"><h3>${t}</h3>${e.map(t=>this.deviceRow(t))}</section>`)}${i.length?W:U`<p class="placeholder">${this.text("empty_room")}</p>`}`}
        </section><section class="detail">${e?U`<button class="mobile-back" @click=${()=>this.navigate(this.roomPath(this.area))}>${this.text("back")} · ${s}</button><farhome-device-editor .hass=${this.hass} .controller=${e} .route=${this.route} .narrow=${this.narrow} @dirty-changed=${t=>{this.dirty=t.detail.dirty,this.requestUpdate()}} @save=${()=>this.refresh()}></farhome-device-editor>${e.image&&/^https:\/\//.test(e.image.source_url)?U`<p class="credit"><a href=${e.image.source_url} target="_blank" rel="noopener noreferrer">${e.image.source_label}</a></p>`:W}`:U`<p class="placeholder">${this.text("select_device")}</p>`}</section></div>
      `:W}
      ${this.pending?U`<div class="dialog-backdrop"><div class="dialog" role="dialog" aria-modal="true" aria-label=${this.text("dirty")} @keydown=${t=>Wt(t,()=>this.stay())}><p>${this.text("leave_question")}</p>${this.editor?.hasHelperDirty?U`<p>${this.text("helper_draft_pending")}</p>`:W}<div class="actions"><button class="primary" ?disabled=${this.editor?.saving||this.editor?.hasHelperDirty} @click=${this.saveLeave}>${this.text("save_leave")}</button><button ?disabled=${this.editor?.saving} @click=${this.leave}>${this.text("discard")}</button><button @click=${this.stay}>${this.text("stay")}</button></div></div></div>`:W}
    </main>`}static{this.styles=[jt,n`
    :host{background:var(--primary-background-color);min-height:100vh}main{max-width:1600px;margin:auto}.top{display:flex;align-items:center;gap:12px;padding:20px 28px}.top h1{flex:1}.legacy{font-size:13px}.global-error{margin:0 28px 18px}nav{display:flex;gap:8px;overflow:auto;padding:0 28px 20px;scrollbar-color:var(--divider-color) transparent}nav button{white-space:nowrap;border-color:transparent}nav [aria-current=page]{background:var(--card-background-color);border-color:var(--primary-color);color:var(--primary-color);font-weight:600}.workspace{display:grid;grid-template-columns:minmax(300px,38%) minmax(0,1fr);margin:0 28px 28px;background:var(--card-background-color);border:1px solid var(--divider-color);border-radius:12px;overflow:hidden}.inventory{min-width:0;border-right:1px solid var(--divider-color)}.room-heading{padding:24px;display:flex;gap:12px;align-items:center;justify-content:space-between}.room-heading h2{font-size:19px}.room-heading button{font-size:13px}.model-group h3{padding:20px 24px 10px;font-size:13px;color:var(--secondary-text-color);font-weight:500}.device{display:flex;width:100%;align-items:center;gap:14px;text-align:left;border:0;border-radius:0;padding:16px 24px;border-top:1px solid var(--divider-color)}.device[aria-pressed=true]{background:var(--primary-background-color)}.device-copy{display:grid;gap:4px;min-width:0}.device-copy strong{font-size:15px;line-height:1.45;overflow-wrap:anywhere}.device-copy small{font-size:12px}.detail{min-width:0}.placeholder{padding:28px;color:var(--secondary-text-color);line-height:1.6}.manual,.unassociated{padding:24px;border-bottom:1px solid var(--divider-color)}.credit{padding:0 28px 24px;font-size:12px}.warnings{padding:0 28px 20px;font-size:13px}.mobile-back{display:none}@media(max-width:800px){.top{padding:16px}.top h1{font-size:23px}nav{padding:0 16px 16px}.workspace{display:block;margin:0 12px 18px}.inventory{border:0}.detail{display:none}.has-device .inventory{display:none}.has-device .detail{display:block}.mobile-back{display:block;margin:16px 16px 0}.room-heading{padding:20px 16px}.model-group h3{padding-inline:16px}.device{padding-inline:16px}.legacy{max-width:110px;line-height:1.3;padding:8px}.global-error{margin:0 12px 16px}.warnings{padding-inline:16px}.credit{padding-inline:16px}}@media(prefers-reduced-motion:no-preference){.workspace{animation:appear .16s ease-out}@keyframes appear{from{opacity:.8}to{opacity:1}}}
  `]}};t([pt({attribute:!1})],he.prototype,"hass",void 0),t([pt({attribute:!1})],he.prototype,"route",void 0),t([pt({type:Boolean})],he.prototype,"narrow",void 0),t([ut()],he.prototype,"snapshot",void 0),t([ut()],he.prototype,"loading",void 0),t([ut()],he.prototype,"error",void 0),t([ut()],he.prototype,"path",void 0),t([ut()],he.prototype,"pending",void 0),t([ut()],he.prototype,"dirty",void 0),t([ut()],he.prototype,"add",void 0),t([ut()],he.prototype,"adding",void 0),t([ut()],he.prototype,"mutation",void 0),t([vt("farhome-device-editor")],he.prototype,"editor",void 0),he=t([ct("farhome-panel")],he);const pe=["ha-automation-action","ha-service-control","ha-selector","ha-yaml-editor","ha-card","ha-alert","ha-svg-icon","ha-icon-button","ha-menu-button","ha-switch","ha-formfield"];let ue=class extends rt{constructor(){super(...arguments),this.narrow=!1,this._params={},this._componentsLoaded=!1}set route(t){const e=this.renderRoot?.querySelector("farhome-panel");if(/^\/(legacy|new|edit)(\/|$)/.test(t.path)&&e&&!e.allowRoute(t.path))return;this._route=t;const i=t.path.split("/");"new"===i[1]?this._params={action:"new",blueprint:i[2]}:"edit"===i[1]?this._params={action:"edit",id:i[2]}:this._params={}}get route(){return this._route}render(){return this._componentsLoaded?"action"in this._params?U`
        <switch-manager-switch-editor
          .hass=${this.hass}
          .narrow=${this.narrow}
          .route=${this._route}
          .panel=${this.panel}
          .params=${this._params}
        ></switch-manager-switch-editor>
      `:this._route?.path.startsWith("/legacy")?U`
      <switch-manager-index
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this._route}
        .panel=${this.panel}
      ></switch-manager-index>
    `:U`<farhome-panel .hass=${this.hass} .narrow=${this.narrow} .route=${this._route}></farhome-panel>`:U`<div class="loading">Loading…</div>`}async firstUpdated(){this.hass.loadFragmentTranslation("config"),this.hass.loadBackendTranslation("title"),this.hass.loadBackendTranslation("device_automation"),this.hass.loadBackendTranslation("config"),this.hass.loadBackendTranslation("services"),this.hass.loadBackendTranslation("selector"),this.hass.loadBackendTranslation("entity_component"),this._applyTheme();try{await async function(t){if(t.every(t=>customElements.get(t)))return;await mt(customElements.whenDefined("partial-panel-resolver"),"waiting for partial-panel-resolver");const e=document.createElement("partial-panel-resolver"),i=[{url_path:"tmp",component_name:"config"}];let s;if("function"==typeof e._getRoutes)s=e._getRoutes(i);else{if("function"!=typeof e._updateRoutes)throw new Error("partial-panel-resolver has neither _getRoutes nor _updateRoutes");e.hass={panels:i,auth:{},config:{state:"RUNNING"}},e._updateRoutes(),s=e.routerOptions}const o=s?.routes?.tmp;if(!o?.load)throw new Error("no tmp route in partial-panel-resolver");await mt(o.load(),"loading the config panel"),await mt(customElements.whenDefined("ha-panel-config"),"waiting for ha-panel-config");const a=document.createElement("ha-panel-config"),n=a.routerOptions?.routes?.automation;if(!n?.load)throw new Error("no automation route in ha-panel-config");await mt(n.load(),"loading the automation editor");const r=t.filter(t=>!customElements.get(t));if(r.length)throw new Error(`Failed to load components: ${r.join(", ")}`)}(pe)}catch(t){console.error("switch_manager: loadHaComponents failed",t)}this._componentsLoaded=!0}updated(t){super.updated(t);const e=t.get("hass");e&&e.themes!==this.hass.themes&&this._applyTheme()}provideHass(t){t.hass=this.hass}_applyTheme(){this.style.backgroundColor="var(--primary-background-color)",this.style.color="var(--primary-text-color)",this.style.fontFamily="var(--mdc-typography-headline6-font-family, var(--mdc-typography-font-family, Roboto, sans-serif))"}static{this.styles=n`
    :host {
      display: block;
    }
    .loading {
      padding: 24px;
      color: var(--secondary-text-color);
    }
  `}};t([pt({attribute:!1})],ue.prototype,"hass",void 0),t([pt({type:Boolean})],ue.prototype,"narrow",void 0),t([pt({attribute:!1})],ue.prototype,"panel",void 0),t([ut()],ue.prototype,"_params",void 0),t([ut()],ue.prototype,"_componentsLoaded",void 0),t([pt({attribute:!1})],ue.prototype,"route",null),ue=t([ct("switch-manager-panel")],ue);let ge=class extends rt{showDialog(t){this._params=t}closeDialog(){this._params&&(this._params=void 0,Ct(this))}render(){return this._params?U`
      <switch-manager-dialog
        @closed=${this._dismiss}
        .heading=${this._params.title||"Confirm"}
      >
        <div>${this._params.text||""}</div>
        ${this._params.prompt?U`<input
              id="prompt-input"
              class="text-input"
              type="text"
              .value=${this._params.promptValue||""}
            />`:""}
        <button slot="actions" @click=${this._dismiss}>
          ${this._params.dismissText||"Cancel"}
        </button>
        <button
          slot="actions"
          @click=${this._confirm}
          class=${this._params.destructive?"destructive":""}
        >
          ${this._params.confirmText||"OK"}
        </button>
      </switch-manager-dialog>
    `:U``}_dismiss(){this._params?.cancel?.(),this.closeDialog()}_confirm(){this._params?.confirm?.(),this.closeDialog()}static{this.styles=n`
    .text-input {
      width: 100%;
      box-sizing: border-box;
      margin-top: 8px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
  `}};t([ut()],ge.prototype,"_params",void 0),ge=t([ct("switch-manager-dialog-confirm")],ge);var ve=Object.freeze({__proto__:null,get SwitchManagerDialogConfirm(){return ge}});const me="__all__",be="__custom__";let _e=class extends rt{constructor(){super(...arguments),this._identifier="",this._discovered=[],this._listening=!1,this._instances=[],this._instanceChoice=me,this._customBaseTopic="",this._instancesLoading=!1,this._error=""}showDialog(t){this._params=t,this._identifier=t.identifier||"",this._discovered=[],this._instances=[],this._instanceChoice=me,this._customBaseTopic="",this._error="",this.hass=this.parentElement?.hass||document.querySelector("home-assistant")?.hass,t.blueprint?.is_zigbee2mqtt?this._loadInstances().then(()=>this._startDiscovery()):this._startDiscovery()}async _loadInstances(){this._instancesLoading=!0;try{const t=await this.hass.callWS({type:xt("zigbee2mqtt/instances")});this._instances=t.instances||[]}catch{this._instances=[]}finally{this._instancesLoading=!1}}_baseTopics(){if(this._params?.blueprint?.is_zigbee2mqtt){if(this._instanceChoice===be){const t=this._customBaseTopic.trim().replace(/^\/+|\/+$/g,"");return t?[t]:void 0}return this._instanceChoice===me?this._instances.length?this._instances:void 0:[this._instanceChoice]}}_discoveryTopics(){const t=this._params?.blueprint?.mqtt_topic_format||"",e=this._baseTopics();if(!e)return[t];const i=t.split("/").slice(1).join("/");return e.map(t=>i?`${t}/${i}`:t)}_onInstanceChange(t){this._instanceChoice=t.target.value,this._restartDiscovery()}_onCustomBaseTopicChange(t){this._customBaseTopic=t.target.value,this._restartDiscovery()}_restartDiscovery(){this._stopDiscovery(),this._discovered=[],this._startDiscovery()}closeDialog(){this._close(!1)}_close(t){if(!this._params)return;this._stopDiscovery();const e=this._params;this._params=void 0,e.onClose?.(t),Ct(this)}async _startDiscovery(){const t=this._params.blueprint;if(t){this._listening=!0;try{this._unsubscribe=await this.hass.connection.subscribeMessage(t=>{t.identifier&&!this._discovered.some(e=>e.identifier===t.identifier)&&(this._discovered=[...this._discovered,{identifier:t.identifier,name:t.name}],this._identifier||this._selectIdentifier(t.identifier))},{type:xt("blueprints/auto_discovery"),blueprint_id:t.id,...this._baseTopics()?{base_topics:this._baseTopics()}:{}})}catch{this._listening=!1}}}_stopDiscovery(){this._unsubscribe?.(),this._unsubscribe=void 0,this._listening=!1}render(){return this._params?U`
      <switch-manager-dialog
        @closed=${this.closeDialog}
        heading="Switch Identifier"
      >
        <div class="content">
          <input
            class="text-input"
            type="text"
            placeholder="Identifier"
            .value=${this._identifier}
            @input=${t=>{this._identifier=t.target.value,this._error=""}}
          />
          ${this._error?U`<div class="error">${this._error}</div>`:""}
          ${this._params.required&&!this._identifier?U`<div class="identifier-ref hint">
                A switch needs an identifier before it can be saved. Press a
                button on the switch and pick it from the list below, or type
                the identifier yourself.
              </div>`:""}

          ${"event_entity"===this._params.blueprint?.event_type?U`<div class="identifier-ref">
                Identifier is the Home Assistant <b>device id</b> of the remote;
                its <code>event.*</code> entities are used.
                |
                <a href="/config/devices/dashboard" target="_blank" rel="noreferrer"
                  >Devices</a
                >
              </div>`:this._params.blueprint?.mqtt_topic_format?U`${this._params.blueprint.is_zigbee2mqtt?this._renderInstanceSelector():""}
                <div class="identifier-ref">
                  MQTT Discovery Topic${this._discoveryTopics().length>1?"s":""}:
                  <b>${this._discoveryTopics().join(", ")}</b>
                  |
                  <a href="/config/mqtt" target="_blank" rel="noreferrer"
                    >MQTT Tool</a
                  >
                </div>`:this._params.blueprint?.event_type?U`<div class="identifier-ref">
                Event Type: <b>${this._params.blueprint.event_type}</b>
                |
                <a href="/developer-tools/event" target="_blank" rel="noreferrer"
                  >Event Tool</a
                >
              </div>`:""}

          ${this._listening?U`
                <div class="discovery">
                  <p>
                    Press a button on your switch to auto-discover its
                    identifier...
                  </p>
                  <div class="spinner"></div>
                  ${this._discovered.length?U`
                        <div class="discovered-list">
                          ${this._discovered.map(t=>U`
                              <div
                                class="list-item ${t.identifier===this._identifier?"selected":""}"
                                @click=${()=>this._selectIdentifier(t.identifier)}
                              >
                                ${t.name?U`<b>${t.name}</b>
                                      <span class="list-item-sub">${t.identifier}</span>`:t.identifier}
                              </div>
                            `)}
                        </div>
                      `:""}
                </div>
              `:""}
        </div>
        <button slot="actions" @click=${this.closeDialog}>Cancel</button>
        <button slot="actions" @click=${this._save}>Save</button>
      </switch-manager-dialog>
    `:U``}_renderInstanceSelector(){return this._instancesLoading?U`<div class="identifier-ref">Looking for Zigbee2MQTT instances...</div>`:U`
      <div class="instance-select">
        <label>
          Zigbee2MQTT instance
          <select .value=${this._instanceChoice} @change=${this._onInstanceChange}>
            ${this._instances.length?U`<option value=${me}>
                    All (${this._instances.length} found)
                  </option>
                  ${this._instances.map(t=>U`<option value=${t}>${t}</option>`)}`:U`<option value=${me}>
                  Default (${"zigbee2mqtt"})
                </option>`}
            <option value=${be}>Custom base topic...</option>
          </select>
        </label>
        ${this._instanceChoice===be?U`<input
              class="text-input"
              type="text"
              placeholder="Base topic, e.g. zigbee2mqtt"
              .value=${this._customBaseTopic}
              @change=${this._onCustomBaseTopicChange}
            />`:""}
        ${this._instances.length?"":U`<div class="identifier-ref hint">
              No Zigbee2MQTT instance detected on the broker (no retained
              <code>+/bridge/state</code>). Listening on the blueprint default;
              pick "Custom base topic..." if yours differs.
            </div>`}
      </div>
    `}_selectIdentifier(t){this._identifier=t,this._error=""}_save(){const t=this._identifier.trim();t?(this._params?.update?.({identifier:t}),this._close(!0)):this._error="Enter an identifier or press a button on the switch and select it below."}static{this.styles=n`
    .content {
      min-width: 300px;
    }
    .text-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    .text-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .instance-select {
      margin-top: 16px;
    }
    .instance-select label {
      display: block;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .instance-select select {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 4px;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    .instance-select select:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    .instance-select .text-input {
      margin-top: 8px;
    }
    .identifier-ref.hint {
      margin-top: 8px;
    }
    .error {
      margin-top: 8px;
      font-size: 0.9em;
      color: var(--error-color, #db4437);
    }
    .identifier-ref {
      margin-top: 16px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .identifier-ref a {
      color: var(--primary-color);
    }
    .discovery {
      margin-top: 16px;
      text-align: center;
    }
    .discovered-list {
      margin-top: 8px;
      text-align: left;
    }
    .list-item {
      cursor: pointer;
      padding: 12px 8px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      margin-top: 4px;
    }
    .list-item.selected {
      border-color: var(--primary-color);
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .list-item-sub {
      display: block;
      font-size: 0.8em;
      color: var(--secondary-text-color);
      word-break: break-all;
    }
    .list-item:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .spinner {
      width: 32px;
      height: 32px;
      margin: 12px auto;
      border: 3px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}};t([ut()],_e.prototype,"_params",void 0),t([ut()],_e.prototype,"_identifier",void 0),t([ut()],_e.prototype,"_discovered",void 0),t([ut()],_e.prototype,"_listening",void 0),t([ut()],_e.prototype,"_instances",void 0),t([ut()],_e.prototype,"_instanceChoice",void 0),t([ut()],_e.prototype,"_customBaseTopic",void 0),t([ut()],_e.prototype,"_instancesLoading",void 0),t([ut()],_e.prototype,"_error",void 0),_e=t([ct("switch-manager-dialog-identifier-auto-discovery")],_e);var fe=Object.freeze({__proto__:null,get SwitchManagerDialogIdentifierAutoDiscovery(){return _e}});let ye=class extends rt{constructor(){super(...arguments),this._name=""}showDialog(t){this._params=t,this._name=t.config?.name||""}closeDialog(){this._close(!1)}_close(t){if(!this._params)return;const e=this._params;this._params=void 0,e.onClose?.(t),Ct(this)}render(){return this._params?U`
      <switch-manager-dialog @closed=${this.closeDialog} heading="Rename Switch">
        <input
          class="text-input"
          type="text"
          placeholder="Name"
          .value=${this._name}
          autofocus
          @input=${t=>this._name=t.target.value}
        />
        <button slot="actions" @click=${this.closeDialog}>Cancel</button>
        <button slot="actions" @click=${this._save}>Save</button>
      </switch-manager-dialog>
    `:U``}_save(){this._name.trim()&&this._params?.update?.({name:this._name.trim()}),this._close(!0)}static{this.styles=n`
    .text-input {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.3));
      border-radius: 6px;
      background: var(--secondary-background-color, transparent);
      color: var(--primary-text-color);
      font: inherit;
    }
    .text-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  `}};t([ut()],ye.prototype,"_params",void 0),t([ut()],ye.prototype,"_name",void 0),ye=t([ct("switch-manager-dialog-rename-switch")],ye);var xe=Object.freeze({__proto__:null,get SwitchManagerDialogRenameSwitch(){return ye}});let $e=class extends rt{constructor(){super(...arguments),this._switches=[],this._copyVariables=!0}showDialog(t){this._params=t,this.hass=this.parentElement?.hass||document.querySelector("home-assistant")?.hass,this._loadSwitches()}closeDialog(){if(!this._params)return;const t=this._params;this._params=void 0,this._switches=[],t.onClose?.(),Ct(this)}async _loadSwitches(){const t=await this.hass.callWS({type:xt("copy_from_list"),blueprint_id:this._params.blueprint_id,skip_config_id:this._params.current_switch_id||""});this._switches=t.switches}render(){return this._params?U`
      <switch-manager-dialog @closed=${this.closeDialog} heading="Copy From">
        <div class="content">
          ${0===this._switches.length?U`<p>No other switches with this blueprint found.</p>`:U`
                <label class="checkbox">
                  <input
                    type="checkbox"
                    .checked=${this._copyVariables}
                    @change=${t=>this._copyVariables=t.target.checked}
                  />
                  Copy variables
                </label>
                <div class="switch-list">
                  ${this._switches.map(t=>U`
                      <div
                        class="list-item"
                        @click=${()=>this._selectSwitch(t)}
                      >
                        ${t.name}
                      </div>
                    `)}
                </div>
              `}
        </div>
        <button slot="actions" @click=${this.closeDialog}>Cancel</button>
      </switch-manager-dialog>
    `:U``}_selectSwitch(t){this._params?.update?.({buttons:JSON.parse(JSON.stringify(t.buttons)),variables:!!this._copyVariables&&JSON.parse(JSON.stringify(t.variables||{}))}),this.closeDialog()}static{this.styles=n`
    .content {
      min-width: 300px;
    }
    .switch-list {
      margin-top: 8px;
    }
    .list-item {
      cursor: pointer;
      padding: 12px 8px;
      border-radius: 4px;
    }
    .list-item:hover {
      background: var(--secondary-background-color, rgba(127, 127, 127, 0.1));
    }
    .checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      cursor: pointer;
    }
  `}};t([ut()],$e.prototype,"_params",void 0),t([ut()],$e.prototype,"_switches",void 0),t([ut()],$e.prototype,"_copyVariables",void 0),$e=t([ct("switch-manager-dialog-copy-from")],$e);var we=Object.freeze({__proto__:null,get SwitchManagerDialogCopyFrom(){return $e}});let ke=class extends rt{constructor(){super(...arguments),this._variables={}}showDialog(t){this._params=t,this._variables=JSON.parse(JSON.stringify(t.config?.variables||{})),this.updateComplete.then(()=>this._yamlEditor?.setValue(this._variables))}closeDialog(){if(!this._params)return;const t=this._params;this._params=void 0,t.onClose?.(),Ct(this)}render(){return this._params?U`
      <switch-manager-dialog @closed=${this.closeDialog} heading="Variables">
        <div class="content">
          <ha-yaml-editor
            .defaultValue=${this._variables}
            @value-changed=${t=>this._variables=t.detail.value}
          ></ha-yaml-editor>
        </div>
        <button slot="actions" @click=${this.closeDialog}>Cancel</button>
        <button slot="actions" @click=${this._save}>Save</button>
      </switch-manager-dialog>
    `:U``}_save(){this._params?.update?.({variables:this._variables}),this.closeDialog()}static{this.styles=n`
    .content {
      min-width: 400px;
    }
  `}};t([ut()],ke.prototype,"_params",void 0),t([ut()],ke.prototype,"_variables",void 0),t([vt("ha-yaml-editor")],ke.prototype,"_yamlEditor",void 0),ke=t([ct("switch-manager-dialog-variables-editor")],ke);var Ce=Object.freeze({__proto__:null,get SwitchManagerDialogVariablesEditor(){return ke}});export{ue as SwitchManagerPanel};
