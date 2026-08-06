export const REGISTRY_TYPES = ['SDK','Analytics','Policy','Package','Container','Template','Schema','Agent','Workflow','Theme'] as const;
export type RegistryType = typeof REGISTRY_TYPES[number];
export interface RegistryManifest {
  catalog_index: number; registry_id: string; name: string; type: RegistryType;
  record_kind: 'registry_manifest'; version: string; status: 'active'|'deprecated'|'experimental'|'disabled';
  runtime: {engine:'node'; minimum_version:string; handler:string};
  permissions: {network:'deny_by_default'|'allowlist'; filesystem:'workspace_scoped'|'read_only'|'none'; process:'internal_allowlist'|'none'};
  capability: {operation:string; description:string}; [key:string]: unknown;
}
export interface RegistryCatalog {schema_version:string; record_kind:'registry_catalog'; ecosystem:{character_agents:112;registry_manifests:23;total_items:135;required_language:string};items:RegistryManifest[]}
export interface ExecutionContext {workspace:string; now:Date; env:Readonly<Record<string,string|undefined>>}
export interface CapabilityResult<T=unknown> {ok:boolean; registryId:string; operation:string; data?:T; errors?:string[]; warnings?:string[]}
export type CapabilityHandler=(input:unknown, context:ExecutionContext)=>Promise<CapabilityResult>;
