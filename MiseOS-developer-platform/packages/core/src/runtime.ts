import path from 'node:path';
import {findManifest,loadCatalog} from './catalog.js'; import {handlers} from './handlers.js';
import type {CapabilityResult,ExecutionContext} from './types.js';
export class RegistryRuntime{
  constructor(private readonly base=process.cwd(),private readonly env:Readonly<Record<string,string|undefined>>=process.env){}
  async execute(registryId:string,input:unknown,workspace=this.base):Promise<CapabilityResult>{
    const catalog=await loadCatalog(this.base);const manifest=findManifest(catalog,registryId);if(!manifest)return {ok:false,registryId,operation:'unknown',errors:[`Unknown registry ID: ${registryId}`]};
    if(manifest.status==='disabled')return {ok:false,registryId,operation:manifest.runtime.handler,errors:['Registry item is disabled']};
    const handler=handlers[manifest.runtime.handler];if(!handler)return {ok:false,registryId,operation:manifest.runtime.handler,errors:[`Handler not implemented: ${manifest.runtime.handler}`]};
    const context:ExecutionContext={workspace:path.resolve(workspace),now:new Date(),env:this.env};
    try{return await handler(input,context)}catch(error){return {ok:false,registryId,operation:manifest.runtime.handler,errors:[error instanceof Error?error.message:String(error)]}}
  }
}
