/** Keep keyboard focus in the two short, explicit confirmation dialogs. */
export function dialogKeys(event:KeyboardEvent,cancel:()=>void){
  const dialog=event.currentTarget as HTMLElement;
  if(event.key==='Escape'){event.preventDefault();cancel();return;}
  if(event.key!=='Tab')return;
  const buttons=Array.from(dialog.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  const active=dialog.getRootNode() as ShadowRoot;
  const index=buttons.indexOf(active.activeElement as HTMLButtonElement);
  if(event.shiftKey&&index<=0){event.preventDefault();buttons.at(-1)?.focus();}
  else if(!event.shiftKey&&index===buttons.length-1){event.preventDefault();buttons[0]?.focus();}
}
