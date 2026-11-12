import {css} from 'lit';
export const controls=css`
  :host{
    --fh-bg:var(--primary-background-color,#f4f6f8);
    --fh-surface:var(--card-background-color,#fff);
    --fh-surface-subtle:var(--secondary-background-color,var(--primary-background-color,#f0f2f5));
    --fh-border:var(--divider-color,rgba(0,0,0,.12));
    --fh-accent:var(--primary-color,#03a9f4);
    --fh-accent-fg:var(--text-primary-color,#fff);
    --fh-muted:var(--secondary-text-color,#6b7280);
    --fh-danger:var(--error-color,#db4437);
    --fh-success:var(--success-color,#10b981);
    --fh-warning:var(--warning-color,#f59e0b);
    --fh-radius:14px;
    --fh-radius-sm:10px;
    --fh-radius-pill:999px;
    display:block;min-width:0;color:var(--primary-text-color);font:inherit;
  }
  *{box-sizing:border-box}
  button,input,select{font:inherit;color:inherit;max-width:100%}
  button,a,input,select{touch-action:manipulation}
  button{
    min-height:40px;padding:9px 14px;border:1px solid var(--fh-border);border-radius:var(--fh-radius-sm);
    background:var(--fh-surface);cursor:pointer;text-align:center;font-weight:500;
    transition:background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease,opacity .15s ease;
  }
  button:hover:not(:disabled){background:var(--fh-surface-subtle)}
  button:disabled{opacity:.48;cursor:default}
  button.primary{color:var(--fh-accent-fg);background:var(--fh-accent);border-color:var(--fh-accent);font-weight:600}
  button.primary:hover:not(:disabled){filter:brightness(1.06);background:var(--fh-accent)}
  button.ghost{border-color:transparent;background:transparent;color:var(--fh-muted)}
  button.ghost:hover:not(:disabled){color:var(--primary-text-color);background:var(--fh-surface-subtle)}
  button.danger-ghost{border-color:transparent;background:transparent;color:var(--fh-danger)}
  button.danger-ghost:hover:not(:disabled){background:color-mix(in srgb,var(--fh-danger) 10%,transparent)}
  :focus-visible{outline:2px solid var(--fh-accent);outline-offset:2px}
  ::selection{background:var(--fh-accent);color:var(--fh-accent-fg)}
  input,select{
    width:100%;min-width:0;min-height:40px;border:1px solid var(--fh-border);border-radius:var(--fh-radius-sm);
    padding:8px 12px;background:var(--fh-surface);caret-color:var(--fh-accent);
    transition:border-color .15s ease,box-shadow .15s ease;
  }
  input:focus-visible,select:focus-visible{border-color:var(--fh-accent)}
  input[type=checkbox]{width:18px;min-height:18px;flex:none;accent-color:var(--fh-accent);cursor:pointer}
  label{display:grid;gap:6px;font-size:13px;font-weight:500;color:var(--fh-muted);min-width:0}
  label>input,label>select{color:var(--primary-text-color);font-weight:400}
  label.check{display:flex;align-items:center;gap:10px;line-height:1.5;color:var(--primary-text-color);font-weight:400;cursor:pointer}
  h1,h2,h3,p{margin:0}
  h1{font-size:22px;font-weight:600;letter-spacing:-.02em}
  h2{font-size:18px;font-weight:600;letter-spacing:-.01em}
  h3{font-size:15px;font-weight:600}
  p{line-height:1.55;overflow-wrap:anywhere}
  a{color:var(--fh-accent);text-underline-offset:3px;overflow-wrap:anywhere}
  .muted,small{color:var(--fh-muted)}
  small{font-size:12px;line-height:1.45}
  .row{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .stack{display:grid;gap:16px}
  .fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,180px),1fr));gap:14px}
  .notice{padding:12px 14px;background:var(--fh-surface-subtle);border:1px solid var(--fh-border);border-radius:var(--fh-radius-sm);line-height:1.55;font-size:13px;overflow-wrap:anywhere}
  [role=alert]{color:var(--fh-danger);border-color:color-mix(in srgb,var(--fh-danger) 35%,var(--fh-border))}
  .status{font-size:12px;color:var(--fh-muted)}
  .actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
  .badge{display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:var(--fh-radius-pill);font-size:12px;font-weight:500;line-height:1.4;font-variant-numeric:tabular-nums;background:var(--fh-surface-subtle);color:var(--fh-muted);border:1px solid var(--fh-border)}
  .badge.active{background:color-mix(in srgb,var(--fh-success) 14%,transparent);color:var(--fh-success);border-color:color-mix(in srgb,var(--fh-success) 28%,transparent)}
  .badge.inactive{background:var(--fh-surface-subtle);color:var(--fh-muted)}
  .badge-dot{width:7px;height:7px;border-radius:50%;background:currentColor;flex:none}
  .segmented{display:inline-flex;flex-wrap:wrap;gap:3px;padding:3px;border-radius:var(--fh-radius-sm);background:var(--fh-surface);border:1px solid var(--fh-border)}
  .segmented button{min-height:34px;padding:6px 12px;border:0;border-radius:7px;background:transparent;color:var(--fh-muted);font-size:13px}
  .segmented button:hover:not(:disabled){color:var(--primary-text-color);background:var(--fh-surface-subtle)}
  .segmented button[aria-pressed=true]{background:var(--fh-accent);color:var(--fh-accent-fg);font-weight:600}
  details.card{border:1px solid var(--fh-border);border-radius:var(--fh-radius);background:var(--fh-surface-subtle);padding:0 16px}
  details.card>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;min-height:46px;padding:12px 0;font-size:14px;font-weight:600}
  details.card>summary::-webkit-details-marker{display:none}
  details.card>summary .chevron{width:18px;height:18px;color:var(--fh-muted);flex:none;transition:transform .16s ease}
  details.card[open]>summary .chevron{transform:rotate(180deg)}
  details.card>.details-body{padding:4px 0 16px;border-top:1px solid var(--fh-border)}
  dialog{margin:auto;width:min(100% - 32px,440px);background:var(--fh-surface);color:var(--primary-text-color);border:1px solid var(--fh-border);padding:24px;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,.28)}
  dialog[open]{display:grid;gap:16px}
  dialog:modal{overscroll-behavior:contain}
  dialog::backdrop{background:rgba(0,0,0,.45);backdrop-filter:blur(4px);overflow:hidden;overscroll-behavior:contain}
  dialog h3{font-size:16px;font-weight:600}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
  @media(prefers-reduced-motion:no-preference){dialog[open]{animation:fh-dialog-in .15s cubic-bezier(.16,1,.3,1)}@keyframes fh-dialog-in{from{opacity:0;transform:scale(.96) translateY(4px)}to{opacity:1;transform:scale(1) translateY(0)}}}
  @media(pointer:coarse){button,input,select{min-height:44px}}
`;
