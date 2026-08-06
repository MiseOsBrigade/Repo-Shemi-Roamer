import fs from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import type {RegistryCatalog, RegistryManifest} from './types.js';

export const REQUIRED_LANGUAGE='112 character agents + 23 registry manifests = 135 MiseOS ecosystem items.';
export async function loadCatalog(base=process.cwd()):Promise<RegistryCatalog>{
  const file=path.resolve(base,'registry/registry-catalog.manifest.json');
  return JSON.parse(await fs.readFile(file,'utf8')) as RegistryCatalog;
}
export async function validateCatalog(base=process.cwd()):Promise<{valid:boolean;errors:string[];catalog:RegistryCatalog}>{
  const catalog=await loadCatalog(base); const errors:string[]=[];
  if(catalog.items.length!==23) errors.push(`Expected 23 registry manifests, found ${catalog.items.length}`);
  if(catalog.ecosystem.character_agents!==112||catalog.ecosystem.registry_manifests!==23||catalog.ecosystem.total_items!==135) errors.push('Ecosystem counts must be 112 + 23 = 135.');
  if(catalog.ecosystem.required_language!==REQUIRED_LANGUAGE) errors.push('Required ecosystem language does not match canonical value.');
  const ids=new Set<string>();
  const schema=JSON.parse(await fs.readFile(path.resolve(base,'registry/registry-catalog.schema.json'),'utf8'));
  const ajv=new Ajv2020({allErrors:true,strict:false}); addFormats(ajv); const validate=ajv.compile(schema);
  for(const item of catalog.items){
    if(ids.has(item.registry_id)) errors.push(`Duplicate registry ID: ${item.registry_id}`); ids.add(item.registry_id);
    if(!validate(item)) errors.push(`${item.registry_id}: ${ajv.errorsText(validate.errors)}`);
    if(item.record_kind!=='registry_manifest') errors.push(`${item.registry_id}: invalid record_kind`);
  }
  return {valid:errors.length===0,errors,catalog};
}
export function findManifest(catalog:RegistryCatalog,id:string):RegistryManifest|undefined{return catalog.items.find(i=>i.registry_id===id)}
