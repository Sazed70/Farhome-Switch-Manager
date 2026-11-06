import type {QuickAction, Domain, QuickKind, ScriptMode, ActionOption, EntityState, ServiceMap, SwitchConfigButtonAction} from './types.js';

const modes = ['single','restart','queued','parallel'];
const domains = ['light','fan','switch','scene','script'];
const entityPattern = /^(light|fan|switch|scene|script)\.[a-z0-9_]+$/;
const record = (value: unknown): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);
const has = (value: object, key: string) => Object.prototype.hasOwnProperty.call(value,key);
const number = (value: unknown, min: number, max=Infinity) => typeof value === 'number' && Number.isFinite(value) && value>=min && value<=max;
const only = (value: object, keys: readonly string[]) => Object.keys(value).every(key=>keys.includes(key));

export function serviceFor(domain: Domain, kind: QuickKind): string|null {
  if (domain==='scene') return kind==='activate'?'scene.turn_on':null;
  if (domain==='script') return kind==='run'?'script.turn_on':null;
  if (kind==='toggle') return `${domain}.toggle`;
  if (kind==='on'||kind==='off') return `${domain}.turn_${kind}`;
  if (domain==='light'&&(kind==='increase'||kind==='decrease')) return 'light.turn_on';
  if (domain==='fan'&&(kind==='increase'||kind==='decrease')) return `fan.${kind}_speed`;
  return null;
}

export function buildQuickAction(value: QuickAction): SwitchConfigButtonAction {
  if (!value||!domains.includes(value.domain)||!entityPattern.test(value.entity_id)||!value.entity_id.startsWith(value.domain+'.')||!modes.includes(value.mode)) throw new Error('invalid_quick_action');
  const service=serviceFor(value.domain,value.kind);
  if (!service) throw new Error('invalid_quick_action');
  const allowed=['domain','kind','entity_id','mode','loop','loop_interval','alias','service_key','data_present'];
  if(value.domain==='light')allowed.push('transition');
  if(value.kind==='increase'||value.kind==='decrease')allowed.push('step');
  if(value.domain==='light'&&['on','toggle'].includes(value.kind))allowed.push('brightness_pct','color_temp_kelvin');
  if(value.domain==='fan'&&value.kind==='on')allowed.push('percentage');
  if(!only(value,allowed))throw new Error('invalid_quick_parameters');
  if(value.loop!==undefined&&typeof value.loop!=='boolean')throw new Error('invalid_loop');
  if(value.loop_interval!==undefined&&(!number(value.loop_interval,50,5000)||!Number.isInteger(value.loop_interval)))throw new Error('invalid_loop_interval');
  if(value.alias!==undefined&&typeof value.alias!=='string')throw new Error('invalid_alias');
  if(value.service_key!==undefined&&!['action','service'].includes(value.service_key))throw new Error('invalid_service_key');
  if(value.data_present!==undefined&&typeof value.data_present!=='boolean')throw new Error('invalid_data_flag');
  const data: Record<string,number>={};
  if(value.kind==='increase'||value.kind==='decrease'){
    if(value.domain==='light'&&value.step===undefined)throw new Error('missing_step');
    if(value.step!==undefined){
      if(!number(value.step,Number.MIN_VALUE,100))throw new Error('invalid_step');
      data[value.domain==='light'?'brightness_step_pct':'percentage_step']=value.domain==='light'&&value.kind==='decrease'?-value.step:value.step;
    }
  }
  for(const key of ['transition','brightness_pct','color_temp_kelvin','percentage'] as const){
    const item=value[key];
    if(item===undefined)continue;
    if(!number(item,key==='color_temp_kelvin'?Number.MIN_VALUE:0,['brightness_pct','percentage'].includes(key)?100:Infinity))throw new Error('invalid_parameter');
    data[key]=item;
  }
  const step:Record<string,unknown>={[value.service_key||'action']:service,target:{entity_id:value.entity_id}};
  if(Object.keys(data).length||value.data_present)step.data=data;
  if(value.alias!==undefined)step.alias=value.alias;
  const result:SwitchConfigButtonAction={mode:value.mode,sequence:[step]};
  if(value.loop!==undefined)result.loop=value.loop;
  if(value.loop_interval!==undefined)result.loop_interval=value.loop_interval;
  return result;
}

export function parseQuickAction(action: SwitchConfigButtonAction): QuickAction|null {
  if(!record(action)||!only(action,['mode','sequence','loop','loop_interval'])||!modes.includes(action.mode)||!Array.isArray(action.sequence)||action.sequence.length!==1)return null;
  const item=action.sequence[0];
  if(!record(item)||!only(item,['action','service','target','data','alias'])||has(item,'action')===has(item,'service')||!record(item.target)||!only(item.target,['entity_id'])||typeof item.target.entity_id!=='string'||!entityPattern.test(item.target.entity_id))return null;
  const key=has(item,'action')?'action':'service';
  const service=item[key];
  const domain=item.target.entity_id.split('.')[0] as Domain;
  if(typeof service!=='string'||!service.startsWith(domain+'.')||(has(item,'data')&&!record(item.data)))return null;
  const data=item.data||{};
  let kind:QuickKind;
  const name=service.slice(domain.length+1);
  if(domain==='scene'&&name==='turn_on')kind='activate';
  else if(domain==='script'&&name==='turn_on')kind='run';
  else if(domain==='fan'&&['increase_speed','decrease_speed'].includes(name))kind=name==='increase_speed'?'increase':'decrease';
  else if(domain==='light'&&name==='turn_on'&&has(data,'brightness_step_pct'))kind=data.brightness_step_pct>0?'increase':'decrease';
  else if(['light','fan','switch'].includes(domain)&&['toggle','turn_on','turn_off'].includes(name))kind=name==='toggle'?'toggle':name==='turn_on'?'on':'off';
  else return null;
  const value:QuickAction={domain,kind,entity_id:item.target.entity_id,mode:action.mode as ScriptMode,service_key:key};
  if(has(action,'loop'))value.loop=action.loop;
  if(has(action,'loop_interval'))value.loop_interval=action.loop_interval;
  if(has(item,'alias'))value.alias=item.alias;
  if(has(item,'data'))value.data_present=true;
  const accepted:string[]=[];
  if(['increase','decrease'].includes(kind)){
    const stepKey=domain==='light'?'brightness_step_pct':'percentage_step';
    if(has(data,stepKey)){
      if(typeof data[stepKey]!=='number')return null;
      value.step=domain==='light'?Math.abs(data[stepKey]):data[stepKey];accepted.push(stepKey);
    }
  }
  if(domain==='light')accepted.push('transition');
  if(domain==='light'&&['on','toggle'].includes(kind))accepted.push('brightness_pct','color_temp_kelvin');
  if(domain==='fan'&&kind==='on')accepted.push('percentage');
  if(!only(data,accepted))return null;
  for(const parameter of ['transition','brightness_pct','color_temp_kelvin','percentage'] as const)if(has(data,parameter))value[parameter]=data[parameter];
  try {buildQuickAction(value);return value;} catch {return null;}
}

export function supportsBrightness(entity: EntityState): boolean {
  const modes=entity.attributes.supported_color_modes;
  return Array.isArray(modes)&&modes.some(mode=>['brightness','color_temp','hs','xy','rgb','rgbw','rgbww','white'].includes(mode));
}

export function supportedQuickActions(entity: EntityState|undefined, services: ServiceMap): ActionOption[] {
  if(!entity)return [];
  const domain=entity.entity_id.split('.')[0] as Domain;
  if(!domains.includes(domain))return [];
  const kinds:QuickKind[]=domain==='scene'?['activate']:domain==='script'?['run']:['toggle','on','off','increase','decrease'];
  const features=Number(entity.attributes.supported_features)||0;
  return kinds.filter(kind=>{
    const service=serviceFor(domain,kind);
    if(!service||!services[domain]?.[service.split('.')[1]])return false;
    if(domain==='fan'){
      if(['increase','decrease'].includes(kind)&&!(features&1))return false;
      if(kind==='on'&&!(features&32))return false;
      if(kind==='off'&&!(features&16))return false;
      if(kind==='toggle'&&(features&48)!==48)return false;
    }
    if(domain==='light'&&['increase','decrease'].includes(kind)&&!supportsBrightness(entity))return false;
    return true;
  }).map(kind=>({kind,label_key:`action_${kind}`}));
}
