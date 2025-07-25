//vite plugin for neo template

import type { Plugin as VitePlugin } from 'vite';
import { generateFromSource, generateFromString, type Plugin } from '../comp-base/view/generation.ts';
import { readFile } from 'node:fs/promises';
import { serialize, type Serializer } from './serialize.ts';
import type { WalkOptions } from '../comp-base/view/walker.ts';
import { resolve, dirname } from 'node:path';

export interface Options {
	libPath: string,
	plugins: Plugin[],
	walk: Partial<WalkOptions>,
	macro: boolean,
	include: string[]
}

const defaultOptions: Options = {
	libPath: '@neocomp/full/',
	plugins: [],
	walk: {
		serialize: true
	},
	macro: false,
	include: ['./src/']
}

export interface GenData {
	imports: Record<string, Set<string>>,
	consts: Record<string, string>
}

const virtmodNS = 'virtual:neo-template';
export function neoTempPlugin (options: Partial<Options> = {}): VitePlugin {
	const opts = { ...defaultOptions, ...options };
	opts.include = opts.include.map(dir => resolve(dir));

	return {
		enforce: 'pre',
		name: 'neo-template',
		resolveId(id, importer) {
			//convert .neo.html module to virtual module with .js extention to make as normal module
			if (!id.endsWith('.neo.html') || !importer) return;
			return `${virtmodNS}/${resolve(dirname(importer), id + '.js')}`
		},
		async load (id) {
			//case .neo.html module
			if (id.startsWith(virtmodNS)) {
				let file: string, path = id.slice(virtmodNS.length + 1, -3);
				try { file = await readFile(path, { encoding: 'utf-8' }) }
				catch (error) {
					throw new Error(`neotemp: no file at path ${path}`);
				}

				return { code: transformNeoTemp(file, opts) }
			}
			
			//module with $template macro
			const path = resolve(id);
			if (opts.macro && opts.include.some(dir => path.startsWith(dir))) {
				try { var file = await readFile(path, { encoding: 'utf-8' }) }
				catch (error) {
					throw new Error(`neotemp: no file at path ${path}`);
				}

				return { code: transformMacroMod(file, opts) }
			}
		},
		handleHotUpdate ({ file, server, timestamp }) {
			if (!file.endsWith('.neo.html')) return;

			//hot reload
			const id = `${virtmodNS}/${file}.js`;
			const mod = server.moduleGraph.getModuleById(id);
			if (!mod) return;
			server.moduleGraph.invalidateModule(mod);
			server.ws.send({
				type: 'full-reload',
				path: id
			});
		},
	}
}

function transformNeoTemp (source: string, options: Options) {
	//generate contents
	const contents = generateFromSource(source, options.plugins, options.walk);

	const data: GenData = {
		consts: {},
		imports: {
			[options.libPath + 'litedom']: new Set(['LiteNode as _LiteNode'])
		},
	}

	const serialized = serialize(contents, data, options);

	const chunks = ['//auto generated from .neo.template'];
	
	//imports
	for (const path in data.imports) 
		chunks.push(`import { ${Array.from(data.imports[path]).join(', ')} } from '${path}';`);
	
	//const
	for (const name in data.consts)
		chunks.push(`const ${name} = ${data.consts[name]};`);

	chunks.push('export default ' + serialized);
	
	return chunks.join('\n');
} 

function transformMacroMod (source: string, options: Options) {
	if (!source.slice(0, 1000).includes('$template')) return source;
	
	const data: GenData = {
		consts: {},
		imports: {
			[options.libPath + 'litedom']: new Set(['LiteNode as _LiteNode'])
		},
	};

	const chunks = ['//auto generated from $template macro enabled module'];

	//substitute $template with reference to the serialized template
	const serializedTemplates: { name: string, source: string }[] = [];
	let curNameInd = 0;
	const substituted = source.replaceAll(/\$template\s*\(\s*`([^`]+)`\s*\)/g, (_, source) => {
		const name = `$__temp${curNameInd++}`;

		//generate content
		const template = generateFromString(source, options.plugins, options.walk);
		const serialized = serialize(template, data, options);

		serializedTemplates.push({ name, source: serialized });
		return name;
	});

	//imports
	for (const path in data.imports) 
		chunks.push(`import { ${Array.from(data.imports[path]).join(', ')} } from '${path}';`);
	
	//const
	for (const name in data.consts)
		chunks.push(`const ${name} = ${data.consts[name]};`);

	//templates
	for (const { name, source } of serializedTemplates) 
		chunks.push(`const ${name} = ${source};`);

	//the rest
	chunks.push('//module source', substituted);
	
	return chunks.join('\n');
}

export * from './serialize.ts';
export type * from './serialize.ts';