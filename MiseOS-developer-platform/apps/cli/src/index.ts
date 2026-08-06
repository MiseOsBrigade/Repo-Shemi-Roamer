#!/usr/bin/env node
import {Command} from 'commander';import {RegistryRuntime,loadCatalog,validateCatalog} from '@miseos/core';
const program=new Command().name('miseos').description('MiseOS Registry CLI').version('1.0.0');
const catalog=program.command('catalog');catalog.command('list').option('--json').action(async opts=>{const c=await loadCatalog();if(opts.json)console.log(JSON.stringify(c,null,2));else for(const i of c.items)console.log(`${i.catalog_index.toString().padStart(2,'0')}  ${i.registry_id.padEnd(34)} ${i.type.padEnd(10)} ${i.name}`)});
catalog.command('validate').action(async()=>{const v=await validateCatalog();console.log(JSON.stringify({valid:v.valid,count:v.catalog.items.length,ecosystem:v.catalog.ecosystem,errors:v.errors},null,2));if(!v.valid)process.exitCode=1});
program.command('run').argument('<registry-id>').option('-i, --input <json>','JSON input','{}').option('-w, --workspace <path>','workspace',process.cwd()).action(async(id,opts)=>{let input;try{input=JSON.parse(opts.input)}catch{throw new Error('--input must be valid JSON')}const r=await new RegistryRuntime().execute(id,input,opts.workspace);console.log(JSON.stringify(r,null,2));if(!r.ok)process.exitCode=1});
program.command('doctor').action(async()=>{const v=await validateCatalog();const checks={node:process.versions.node,catalog:v.valid,registryItems:v.catalog.items.length,language:v.catalog.ecosystem.required_language};console.log(JSON.stringify(checks,null,2));if(!v.valid)process.exitCode=1});
await program.parseAsync();
