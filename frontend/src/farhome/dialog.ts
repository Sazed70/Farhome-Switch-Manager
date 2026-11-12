/** Keep a native <dialog> element synchronized with Lit open state. */
export function syncModalDialog(dialog:HTMLDialogElement|null|undefined,open:boolean){
  if(!dialog)return;
  if(open&&!dialog.open)dialog.showModal();
  else if(!open&&dialog.open)dialog.close();
}
