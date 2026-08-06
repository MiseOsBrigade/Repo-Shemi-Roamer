import fs from 'node:fs/promises'; import path from 'node:path'; import crypto from 'node:crypto';
export const asRecord=(v:unknown):Record<string,unknown>=>typeof v==='object'&&v!==null&&!Array.isArray(v)?v as Record<string,unknown>:{};
export const asStrings=(v:unknown):string[]=>Array.isArray(v)?v.filter((x):x is string=>typeof x==='string'):[];
export const hash=(v:string)=>crypto.createHash('sha256').update(v).digest('hex');
export async function exists(workspace:string,p:string){try{await fs.access(path.resolve(workspace,p));return true}catch{return false}}
export async function readOptional(workspace:string,p:string){try{return await fs.readFile(path.resolve(workspace,p),'utf8')}catch{return undefined}}
export async function writeWorkspace(workspace:string,p:string,content:string){const full=path.resolve(workspace,p);const base=path.resolve(workspace);if(!full.startsWith(base+path.sep)&&full!==base)throw new Error('Path escapes workspace');await fs.mkdir(path.dirname(full),{recursive:true});await fs.writeFile(full,content,'utf8');return full}
export const result=(registryId:string,operation:string,data:unknown,warnings:string[]=[])=>({ok:true,registryId,operation,data,warnings});
export const failed=(registryId:string,operation:string,...errors:string[])=>({ok:false,registryId,operation,errors});
