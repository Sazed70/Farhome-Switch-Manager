import {css} from 'lit';
export const controls=css`
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
`;
