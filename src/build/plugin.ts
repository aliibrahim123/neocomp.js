// vite plugin for neo template

import type { Plugin as VitePlugin } from 'vite';
import { readFile } from 'node:fs/promises';
import { serialize, type Serializer } from './serialize.ts';
import { resolve } from 'node:path';
import { type ParseState } from '../litedom/parse.ts';
import { parseChunk } from '../comp-base/view/chunk.ts';

export interface Options {
	libPath: string,
	include: string[]
}

const defaultOptions: Options = {
	libPath: '@neocomp/full/',
	include: ['./src/']
}

export interface GenData {
	imports: Record<string, Set<string>>,
	consts: Record<string, string>
}

const virtmodNS = 'virtual:neo-template';
export function neoTempPlugin (options: Partial<Options> = {}): VitePlugin {
	let opts = { ...defaultOptions, ...options };
	opts.include = opts.include.map(dir => resolve(dir));

	return {
		enforce: 'pre',
		name: 'neo-template',
		async load (id) {
			// module with $template macro
			let path = resolve(id);
			if (opts.include.some(dir => path.startsWith(dir))) {
				try { var file = await readFile(path, { encoding: 'utf-8' }) }
				catch (error) {
					throw new Error(`neotemp: no file at path ${path}`);
				}

				return { code: transformMacroMod(file, opts) }
			}
		},
	}
}

function transformMacroMod (source: string, options: Options) {
	let sample = source.slice(0, 1000);
	if (!(sample.includes('html') || sample.includes('$chunk'))) return source;

	let data: GenData = {
		consts: {},
		imports: {
			[options.libPath + 'litedom']: new Set(['LiteNode as _LiteNode'])
		},
	};

	let chunks = ['// auto generated from html macro enabled module'];

	// substitute html with reference to the serialized chunk
	let serializedChunks: { name: string, source: string }[] = [];
	let lastState: ParseState;
	let curNameInd = 0, ind = 0;
	// html, $chunk, ensure
	const pattern =
		/(?:(?:html|\$chunk)\s*`([^`]+)`)|(?:ensure\s*\(\s*["']([^"']+)["']\))/g;
	let substituted = source.replaceAll(pattern, (match, src: string, cond: string, startInd: number) => {
		// ensure, set parse state and remove from source
		if (match.startsWith('ensure')) {
			lastState = cond === 'in_attrs'
				? { inside: 'attrs', parentWSTags: 0 }
				: { inside: 'content', parentWSTags: 0 };

			return ''
		}

		let name = `$__chunk${curNameInd++}`;

		// split src into parts and args
		let parts: string[] = [], args: string[] = [];
		let ind = 0;
		while (ind < src.length) {
			let nextArg = src.indexOf('${', ind);
			// add part from last arg to next
			parts.push(src.slice(ind, nextArg === -1 ? src.length : nextArg));

			if (nextArg === -1) break;
			ind = nextArg + 2;

			// extract arg by counting braces
			let argStart = ind;
			let braceCount = 1;
			while (braceCount !== 0) {
				let nextOpen = src.indexOf('{', ind);
				let nextClose = src.indexOf('}', ind);
				if (nextClose === -1) throw new SyntaxError(
					`neotemp: unclosed argument at (${startInd + argStart})`
				);
				// close brace is nearest
				if (nextOpen === -1 || nextClose < nextOpen) {
					braceCount--;
					ind = nextClose + 1;
				}
				// open one is nearest
				else {
					braceCount++;
					ind = nextOpen + 1;
				}
			}
			args.push(src.slice(argStart, ind - 1));
		}
		if (src.endsWith('}')) parts.push('');

		// parse chunk
		let chunk = parseChunk(parts, lastState);
		lastState = chunk.state;
		chunk.stops = [];
		// serialize and add
		serializedChunks.push({ name, source: serialize(chunk, data, options) });

		// substitute it with call to build.add
		if (match.startsWith('$chunk')) return `chunk(build => build.add(${name}, [${args.join(', ')}]))`;
		return `html.add(${name}, [${args.join(', ')}])`;
	})

	// imports
	for (let path in data.imports)
		chunks.push(`import { ${Array.from(data.imports[path]).join(', ')} } from '${path}';`);

	// consts
	for (let name in data.consts)
		chunks.push(`const ${name} = ${data.consts[name]};`);

	// chunks
	for (let { name, source } of serializedChunks)
		chunks.push(`const ${name} = ${source};`);

	// the rest
	chunks.push('// module source', substituted);

	return chunks.join('\n');
}


export * from './serialize.ts';
export type * from './serialize.ts';