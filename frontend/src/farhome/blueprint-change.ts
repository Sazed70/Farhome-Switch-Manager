import type {Blueprint,BlueprintButtonAction} from '../types.js';

function eventSource(blueprint:Blueprint){
  return JSON.stringify([blueprint.event_type,blueprint.identifier_key,blueprint.mqtt_topic_format,!!blueprint.mqtt_sub_topics]);
}

export function sharesIdentifier(before:Blueprint|undefined,after:Blueprint){
  return !!before&&eventSource(before)===eventSource(after);
}

function eventRule(action:BlueprintButtonAction){
  const {release_index,...rule}=action;
  return rule;
}

function signatures(blueprint:Blueprint){
  const result=new Map<string,string[]>();
  blueprint.buttons.forEach((button,b)=>button.actions.forEach((action,a)=>{
    const release=action.release_index==null?undefined:button.actions[action.release_index];
    const signature=JSON.stringify([button.conditions,eventRule(action),release?eventRule(release):null]);
    result.set(signature,[...(result.get(signature)||[]),`${b}:${a}`]);
  }));
  return result;
}

export function matchingGestures(before:Blueprint|undefined,after:Blueprint):Map<string,string>{
  const result=new Map<string,string>();
  if(!before||!sharesIdentifier(before,after)||JSON.stringify(before.conditions)!==JSON.stringify(after.conditions))return result;
  const next=signatures(after);
  for(const [signature,oldKeys] of signatures(before)){
    const newKeys=next.get(signature);
    if(oldKeys.length===1&&newKeys?.length===1)result.set(oldKeys[0],newKeys[0]);
  }
  return result;
}
