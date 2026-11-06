import type {HomeAssistant, SwitchConfig, Blueprint, SwitchConfigButtonAction} from '../types.js';

export type Domain = 'light'|'fan'|'switch'|'scene'|'script';
export type QuickKind = 'toggle'|'on'|'off'|'increase'|'decrease'|'activate'|'run';
export type ScriptMode = 'single'|'restart'|'queued'|'parallel';
export interface QuickAction {
  domain: Domain; kind: QuickKind; entity_id: string; mode: ScriptMode;
  step?: number; transition?: number; brightness_pct?: number;
  color_temp_kelvin?: number; percentage?: number;
  loop?: boolean; loop_interval?: number; alias?: string;
  service_key?: 'action'|'service'; data_present?: boolean;
}
export interface QuickPatch {button: number; action: number; value: QuickAction;}
export type SelectorKind = 'next'|'brightness_up'|'brightness_down';
export interface SelectorAction {helper_id:string;kind:SelectorKind;step:number;transition:number;mode:ScriptMode;}
export interface SelectorPatch extends Omit<SelectorAction,'helper_id'> {button:number;action:number;}
export interface SelectorSnapshot {entity_id:string;options:string[];active:string;initial:string|null;origin:'ui'|'yaml_or_unknown';editable:boolean;readonly_reason:string|null;revision:string;known_references:{type:string;id:string}[];}
export interface ActionOption {kind: QuickKind; label_key: string;}
export interface EntityState {entity_id: string; state: string; attributes: Record<string, any>;}
export type ServiceMap = Record<string, Record<string, {fields?: Record<string, any>; [key:string]: unknown}>>;
export interface FarhomeHass extends HomeAssistant {states: Record<string, EntityState>; services: ServiceMap;}
export interface ImageAsset {url: string; source_url: string; source_label: string;}
export interface Controller {
  device_id: string; name: string; area_id: string|null;
  manufacturer: string; model: string; config_ids: string[];
  management: 'farhome'|'external'|'unknown'; compatibility: 'verified'|'unverified';
  external_automations: string[]; image: ImageAsset|null;
}
export interface ControllerMetadata {manual?: boolean; management?: 'unknown'|'external'; external_automations?: string[];}
export interface Binding {device_id: string; verified?: boolean; selector_helper?: string|null; conflicts_checked?: boolean;}
export interface Metadata {version: 1; controllers: Record<string, ControllerMetadata>; bindings: Record<string, Binding>;}
export interface MetadataPatch {controllers?: Record<string, ControllerMetadata|null>; bindings?: Record<string, Binding|null>;}
export interface RegistryDevice {id: string; name?: string|null; name_by_user?: string|null; manufacturer?: string|null; model?: string|null; area_id?: string|null;}
export interface Snapshot {
  areas: {id:string;name:string}[]; controllers: Controller[];
  unassociated_configs: {config_id:string;name:string;reason:string}[];
  available_devices: RegistryDevice[]; revision: string; metadata_revision: string;
  metadata: Metadata; warnings: string[];
}
export type EditableConfig = Omit<SwitchConfig,'blueprint'> & {blueprint: Blueprint|string};
export interface ConfigEnvelope {config_id: string; config: EditableConfig; metadata: Binding|null; revision: string;}
export type {SwitchConfigButtonAction};
