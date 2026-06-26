import type { Plugin } from 'vite';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { parse } from '@neocomp/core/html-parser';

export interface Options {
	include: string[];
}

const defaultOptions: Options = {
	include: ['./src/'],
};

export function neocomp(options: Options): Plugin {
	let opts = { ...defaultOptions, ...options };
	opts.include = opts.include.map((dir) => resolve(dir));

	return {
		enforce: 'pre',
		name: 'neo-template',
		async load(id) {
			let path = resolve(id);
			let file: string;
			if (opts.include.some((dir) => path.startsWith(dir))) {
				try {
					file = await readFile(path, { encoding: 'utf-8' });
				} catch (_error) {
					throw new Error(`neocomp: no file at path ${path}`);
				}

				return { code: compile_templates(file, opts) };
			}
		},
	};
}

function resolve_escapes(str: string) {
	return str.replaceAll(/\\(['"`ntr]|x..|u{[^}]+}|u....)/g, (_match, code) => {
		if (code === "'") return "'";
		if (code === '"') return '"';
		if (code === '`') return '`';
		if (code === 'n') return '\n';
		if (code === 't') return '\t';
		if (code === 'r') return '\r';
		if (code.startsWith('x')) return String.fromCharCode(parseInt(code.slice(1), 16));
		if (code.startsWith('u{')) return String.fromCodePoint(parseInt(code.slice(2, -1), 16));
		return String.fromCodePoint(parseInt(code.slice(1), 16));
	});
}

function find_unescaped(src: string, char: string, start: number): number {
	let i = start;
	while (true) {
		i = src.indexOf(char, i);
		if (i === -1) return -1;

		let backslash_count = 0;
		let j = i - 1;
		while (j >= 0 && src[j] === '\\') {
			backslash_count++;
			j--;
		}
		if (backslash_count % 2 === 0) return i;
		i++;
	}
}

type Context = {
	ind: number;
	chunks: (string | null)[];
	result: string[];
};

type TemplateCallbacks = {
	part: (part: string) => void;
	before_arg: () => void;
	after_arg: () => void;
};

function skip_template(src: string, ctx: Context) {
	ctx.result.push('`');
	walk_template(src, ctx, {
		part: (part) => ctx.result.push(part),
		before_arg: () => ctx.result.push('${'),
		after_arg: () => ctx.result.push('}'),
	});
	ctx.result.push('`');
}

function walk_template(src: string, ctx: Context, callbacks: TemplateCallbacks) {
	ctx.ind += 1;

	while (true) {
		let end = find_unescaped(src, '`', ctx.ind);
		if (end === -1) throw new Error('unclosed template');
		let next_arg = find_unescaped(src, '${', ctx.ind);
		if (next_arg > end) next_arg = -1;

		let part = src.slice(ctx.ind, next_arg == -1 ? end : next_arg);
		callbacks.part(part);

		if (next_arg === -1) {
			ctx.ind = end + 1;
			break;
		}

		let last_stop = next_arg + 2;
		ctx.ind = last_stop;
		callbacks.before_arg();
		let curly_depth = 1;

		while (true) {
			let cur_char = src[ctx.ind];
			if (cur_char === '{') curly_depth += 1;
			if (cur_char === '}') curly_depth -= 1;
			if (curly_depth === 0) break;

			if (cur_char === "'" || cur_char === '"') {
				ctx.ind = find_unescaped(src, cur_char, ctx.ind + 1);
				if (ctx.ind === -1) throw new Error('unclosed string');
			}

			if (cur_char === '`') {
				ctx.result.push(src.slice(last_stop, ctx.ind));

				if (src.slice(ctx.ind - 4, ctx.ind) === 'html') compile_template(src, ctx);
				else skip_template(src, ctx);

				last_stop = ctx.ind;
				continue;
			}
			ctx.ind += 1;
		}

		ctx.result.push(src.slice(last_stop, ctx.ind));
		ctx.ind += 1;
		callbacks.after_arg();
	}
}

function compile_template(src: string, ctx: Context) {
	let parts: string[] = [];
	let id = ctx.chunks.length;
	ctx.result.push(`.__add(__neocomp_chunk_${id}, [`);
	ctx.chunks.push(null);
	walk_template(src, ctx, {
		part: (part) => parts.push(resolve_escapes(part)),
		before_arg: () => {},
		after_arg: () => ctx.result.push(', '),
	});
	ctx.result.push('])');
	ctx.chunks[id] = `const __neocomp_chunk_${id} = ${JSON.stringify(parse(parts))};\n`;
}

function compile_templates(src: string, _opts: Options): string {
	let ctx: Context = { ind: 0, chunks: [], result: [] };
	while (ctx.ind < src.length) {
		let next_template = find_unescaped(src, '`', ctx.ind);
		ctx.result.push(src.slice(ctx.ind, next_template === -1 ? src.length : next_template));

		if (next_template === -1) break;
		ctx.ind = next_template;

		if (src.slice(next_template - 4, next_template) === 'html') compile_template(src, ctx);
		else skip_template(src, ctx);
	}
	return ctx.chunks.join('') + ctx.result.join('');
}
