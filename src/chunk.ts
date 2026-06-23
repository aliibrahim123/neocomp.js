import type { Element as LiteElement } from './html-parser.ts';
import type { Context } from './index.ts';
import { ROSignal, Signal, type SlabID, Store, StoreProv } from './reactive.ts';

const parse = (globalThis as any).__neocomp_enable_chunk_parsing
	? (await import('./html-parser.ts')).parse
	: () => {
		throw new Error('chunk parsing not enabled');
	};

const chunk_registery = new Map<string[], LiteElement>();

const class_prefix = 'class:';
const style_prefix = 'style:';
const prop_prefix = 'prop:';
function apply_attr(el: Element, attr: string, value: any) {
	if (attr.startsWith(class_prefix)) el.classList.toggle(attr.slice(class_prefix.length), value);
	else if (attr.startsWith(style_prefix)) {
		(el as HTMLElement).style.setProperty(attr.slice(style_prefix.length), value);
	} else if (attr.startsWith(prop_prefix)) (el as any)[attr.slice(prop_prefix.length)] = value;
	else if (typeof value === 'boolean') el.toggleAttribute(attr, value);
	else if (value === null || value === undefined) el.removeAttribute(attr);
	else el.setAttribute(attr, String(value));
}

function into_node(value: any): Node {
	if (value instanceof Node) return value;
	if (value === null || value === undefined) return document.createTextNode('');
	return document.createTextNode(String(value));
}
function dynamic_node(build: ChunkBuild, el: Element, getter: () => any) {
	let last_node = into_node(getter());
	el.appendChild(last_node);
	if (last_node instanceof Text) {
		build.effect(() => {
			let value = getter();
			if (value === undefined || value === null) last_node.nodeValue = '';
			else last_node.nodeValue = String(value);
		});
	} else {
		build.effect(() => {
			let node = getter();
			el.replaceChild(node, last_node);
			last_node = node;
		});
	}
}

function contruct(build: ChunkBuild, lite: LiteElement, args: any[]): Element {
	let el = document.createElement(lite.tag);
	for (let { attr, value } of lite.attrs) {
		let arg = typeof value === 'string' ? value : args[value];
		if (arg instanceof Signal || arg instanceof ROSignal) {
			build.effect(() => apply_attr(el, attr, arg.value));
		} else if (typeof arg === 'function') {
			build.effect(() => apply_attr(el, attr, arg()));
		} else apply_attr(el, attr, value);
	}
	for (let child of lite.children) {
		if (typeof (child as any)?.tag == 'string') {
			let _child = contruct(build, child as any, args);
			el.append(_child);
		} else if ((child as any)?.type === 'do') {
			build.__el_stack.push(el);
			args[(child as any).arg](build, el);
			build.__el_stack.pop();
		} else {
			let arg = typeof child === 'number' ? args[child] : child;
			if (arg instanceof Signal || arg instanceof ROSignal) {
				dynamic_node(build, el, () => arg.value);
			} else if (typeof arg === 'function') dynamic_node(build, el, arg);
			else el.append(into_node(arg));
		}
	}
	return el;
}

export class ChunkBuild extends StoreProv {
	#base_el: Element;
	__el_stack: Element[];
	constructor(ctx: Context, base_el: Element, slab: SlabID | undefined = undefined) {
		super();
		super.init(ctx, slab);
		this.#base_el = base_el;
		this.__el_stack = [base_el];
	}

	get base_el(): Element {
		return this.#base_el;
	}
	get cur_el(): Element {
		return this.__el_stack.at(-1)!;
	}

	chunk(parts: TemplateStringsArray, ...args: any[]) {
		let _parts = parts as any as string[];
		if (chunk_registery.has(_parts)) return this.__add(chunk_registery.get(_parts)!, args);
		let lite = parse(_parts);
		chunk_registery.set(_parts, lite);
		this.__add(lite, args);
	}
	__add(lite: LiteElement, args: any[]) {
		this.cur_el.append(contruct(this, lite, args));
	}
}

export class RemovableChunk extends ChunkBuild {
	remove() {
		this.base_el.remove();
		if (this.slab != undefined) this.store.remove_slab(this.slab);
	}
}
