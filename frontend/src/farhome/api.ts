import type {HomeAssistant} from '../types.js';
import type {Snapshot, ConfigEnvelope, EditableConfig, Binding, MetadataPatch, Metadata, QuickPatch} from './types.js';

export class FarhomeApi {
  constructor(private hass:HomeAssistant){}
  snapshot():Promise<Snapshot>{return this.hass.callWS({type:'switch_manager/farhome/snapshot'});}
  get(config_id:string):Promise<ConfigEnvelope>{return this.hass.callWS({type:'switch_manager/farhome/config/get',config_id});}
  save(config:EditableConfig,metadata:Binding|null|undefined,expected_revision:string|undefined,quick_actions:QuickPatch[]=[]):Promise<ConfigEnvelope>{
    return this.hass.callWS({type:'switch_manager/farhome/config/save',config:{...config,blueprint:typeof config.blueprint==='string'?config.blueprint:config.blueprint.id},metadata,expected_revision,quick_actions});
  }
  setEnabled(config_id:string,enabled:boolean,expected_revision:string,conflict_check:boolean):Promise<ConfigEnvelope>{
    return this.hass.callWS({type:'switch_manager/farhome/config/enabled',config_id,enabled,expected_revision,conflict_check});
  }
  saveMetadata(patch:MetadataPatch,expected_revision:string):Promise<{revision:string;metadata:Metadata}>{
    return this.hass.callWS({type:'switch_manager/farhome/metadata/save',patch,expected_revision});
  }
}
