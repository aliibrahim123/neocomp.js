//vite plugin for neo template

import type { Plugin as VitePlugin } from 'vite';
import { generateFromString, type Plugin } from '../comp-base/view/generation.ts';
import { readFile } from 'node:fs/promises';
import { serialize, type Serializer } from './serialize.ts';
import type { WalkOptions } from '../comp-base/view/walker.ts';

export interface Options {
	libPath: string,
	plugins: Plugin[],
	walk: Partial<WalkOptions>
}

const defaultOptions: Options = {
	libPath: '@neocomp/full/',
	plugins: [],
	walk: {
		serialize: true
	}
}

export interface GenData {
	imports: Record<string, Set<string>>,
	consts: Record<string, string>
}

export function neoTempPlugin (options: Partial<Options> = {}): VitePlugin {
	const opts = { ...defaultOptions, ...options };

	return {
		name: 'neo-template',
		async load (id) {
			if (!id.endsWith('.neo.html')) return;
			
			let file: string;
			try { file = await readFile(id, { encoding: 'utf-8' }) }
			catch (error) {
				throw new Error(`neotemp: no file at path ${id}`);
			}

			return { code: transform(file, opts) }
		},
	}
}

function transform (source: string, options: Options) {
	//generate contents
	const contents = generateFromString(source, options.plugins, options.walk);

	const data: GenData = {
		consts: {},
		imports: {
			[options.libPath + 'litedom/core.ts']: new Set(['LiteNode'])
		},
	}

	const chunks = ['//auto generated from .neo.template']
	
	//imports
	for (const path in data.imports) 
		chunks.push(`import { ${Array.from(data.imports[path]).join(', ')} } from '${path}';`);
	
	//const
	for (const name in data.consts)
		chunks.push(`const ${name} = ${data.consts[name]}`);

	chunks.push('export default ' + serialize(contents, data, options));

	return chunks.join('\n');
}

export * from './serialize.ts';
export type * from './serialize.ts';