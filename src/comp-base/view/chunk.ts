import { builder } from "../../litedom/builder.ts";
import type { LiteNode } from "../../litedom/node.ts";
import type { parseChunk as t_parseChunk, Options, ParsedChunk, ParseState } from "../../litedom/parse.ts";
import { Event } from "../../common/event.ts";
import { attachedComp, Component } from "../core/comp.ts";
import { ReadOnlySignal, Signal } from "../state/signal.ts";
import { throw_chunk_cond_not_met } from "./errors.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { fn } from "../../common/types.ts";

// import parseChunk if specified
let _parseChunk = undefined as any as typeof t_parseChunk;
if (!(globalThis as any).__neocomp_disable_chunk_parsing === true)
	_parseChunk = (await import("../../litedom/parse.ts")).parseChunk;

const chunkRegistry = new Map<string[], ParsedChunk>();

/** default template parse options */
const parseOptions: Partial<Options> = {
	rootTag: 'neo:template',
	tagStart: /^[^'"=`<>/\s]/,
	tagRest: /^[^'"=`<>/\s]+/,
	attrStart: /^[^'"=`<>\s]/,
	attrRest: /^[^'"=`<>\s]+/,
	lowerAttr: false,
	rawTextTags: new Set(['script', 'style', 'svg']),
	lowerTag: false
}

/** parse a chunk from template */
export function parseChunk (parts: string[], state?: ParseState) {
	var chunk = _parseChunk(parts, parseOptions, state);
	// gather actions at stops
	for (const [ind, stop] of chunk.stops.entries()) {
		var action: Action = stop.at === 'attr' ?
			{ type: 'attr', attr: stop.attr, argInd: ind } :
			{ type: stop.at, argInd: ind };

		if (stop.node.meta.has('actions'))
			stop.node.meta.get('actions').push(action);
		else stop.node.meta.set('actions', [action]);
	}

	return chunk
}

type Action = {
	argInd: number
} & ({
	type: 'attrs' | 'content'
} | {
	type: 'attr'
	attr: string
});

export let isDefered = Symbol('neocomp:defered-fn');

function apply (el: HTMLElement, comp: Component, value: any, handle: (value: any) => void) {
	// bind signal
	if (value instanceof Signal || value instanceof ReadOnlySignal)
		comp.store.effect([value], [], () => handle(value.value), undefined, { el });
	// bind computed exp
	else if (typeof (value) === 'function')
		comp.store.effect(() => handle(value(el, comp)), undefined, { el });
	else handle(value);
}
function setAttr (el: HTMLElement, attr: string, value: any) {
	// property
	if (attr[0] === '.') (el as any)[attr.slice(1)] = value;
	// style property
	else if (attr.startsWith('style:')) el.style.setProperty(attr.slice(6), value);
	// class
	else if (attr.startsWith('class:')) el.classList.toggle(attr.slice(6), !!value);
	// boolean attribute
	else if (typeof (value) === 'boolean') el.toggleAttribute(attr, value);
	// remove attribute
	else if (value === undefined || value === null) el.removeAttribute(attr);
	// normal attribute
	else el.setAttribute(attr, String(value));
}
function handleAttr (el: HTMLElement, comp: Component, attr: string, value: any) {
	// event listener
	if (attr.startsWith('on:'))
		el.addEventListener(attr.slice(3), (event) => value(el, event, comp));
	// class map
	else if (attr === 'class') for (const name in value)
		apply(el, comp, value[name], value => el.classList.toggle(name, !!value));
	// style map
	else if (attr === 'style') for (const name in value)
		apply(el, comp, value[name], value => el.style.setProperty(name, value));
	// normal attribute
	else apply(el, comp, value, value => setAttr(el, attr, value))
}
function setContent (el: HTMLElement, target: ChildNode, comp: Component, value: any) {
	let newTarget: ChildNode;
	// component
	if (value?.onInit instanceof Event) {
		// case inited
		if (value.status === 'inited') {
			comp.addChild(value);
			newTarget = value.el;
		}
		// else wait to init, add a placeholder 
		else {
			newTarget = document.createElement('span');
			(value as Component).onInit.listen(child => {
				// if disconnected before init
				if (!newTarget.parentElement) return;
				comp.addChild(child);
				newTarget.replaceWith(child.el);
			});
		}
	}
	// node
	else if (value instanceof Node) newTarget = value as ChildNode;
	// falsy value, empty string as placeholder
	else if (value === undefined || value === null || value === false) newTarget = new Text('');
	// text, doesnt support whitespace
	else {
		newTarget = document.createElement('span');
		(newTarget as HTMLElement).innerText = String(value);
	};

	target.replaceWith(newTarget);
	// remove attached component
	if ((target as any)[attachedComp]) (target as any)[attachedComp].remove();
	return newTarget
}
function doActions (
	el: HTMLElement, comp: Component, actions: Action[],
	args: any[], deferedFns: ((el: HTMLElement, comp: Component) => void)[]
) {
	for (const action of actions) {
		let arg = args[action.argInd];

		// single attribute
		if (action.type === 'attr') handleAttr(el, comp, action.attr, arg);

		// inside attributes
		else if (action.type === 'attrs') {
			// action function
			if (typeof (arg) === 'function') {
				if (arg[isDefered]) deferedFns.push(() => arg(el, comp));
				else arg(el, comp);
			}
			// atribute map
			else for (const attr in arg) handleAttr(el, comp, attr, arg[attr]);
		}

		// content
		else {
			let target = el.querySelector('stop-target') as ChildNode;

			// snippets
			if (arg?.isSnippet === true) target.replaceWith((arg as fn)(el, comp));
			// static text
			else if (typeof (arg) === 'string') {
				let el = document.createElement('span');
				el.innerText = arg;
				target.replaceWith(...el.childNodes)
			}
			// node array
			else if (arg?.length !== undefined && arg[0] instanceof Node)
				target.replaceWith(...arg);
			else apply(el, comp, arg, arg => target = setContent(el, target, comp, arg));
		}
	}
}

type ChunkPrimValue = string | number | boolean | undefined | null;
type ChunkInpValue<T, E extends HTMLElement> =
	((el: E, comp: Component) => T) | Signal<T> | ReadOnlySignal<T> | T
export type ChunkInp<E extends HTMLElement = HTMLElement> =
	((el: E, comp: Component) => void)
	| ChunkInpValue<Node | Component | ChunkPrimValue, E> | ArrayLike<Node>
	| Record<string, ChunkInpValue<ChunkPrimValue, E>>;

/** unit responsible for building chunks */
export interface ChunkBuild {
	/** add a parsed section to the chunk  */
	add: <E extends HTMLElement = HTMLElement> (chunk: ParsedChunk, args: ChunkInp<E>[]) => void;
	/** template function for adding new sections */
	html: <E extends HTMLElement = HTMLElement> (parts: TemplateStringsArray, ...args: ChunkInp<E>[]) => void;
	/** ensure a condition is met */
	ensure: (cond: 'in_attrs' | 'in_content') => void;
	/** end the build */
	end: () => HTMLElement
}

const defaultConverters = {
	svg (lite: LiteNode) {
		let node = document.createElementNS("http://www.w3.org/2000/svg", lite.tag);
		for (let [attr, value] of lite.attrs) node.setAttribute(attr, value);
		node.innerHTML = lite.children[0] as string;
		return node
	}
}

/** create a chunk */
export function createChunk (
	comp: Component, el?: HTMLElement, liteConverters: Record<string, (lite: LiteNode) => Node> = {}
): ChunkBuild {
	let deferedFns: ((el: HTMLElement, comp: Component) => void)[] = [];
	let lastEl: HTMLElement;

	let { add: addPart, end: build } = builder(el || 'neo:template', (lite, el) => {
		// deferred actions
		if (lastEl !== el) for (const fn of deferedFns) fn(lastEl, comp);
		deferedFns = [];
		lastEl = el;

		// actions
		let actions = lite.meta.get('actions');
		if (actions) doActions(el, comp, actions, curArgs, deferedFns);
	}, { ...defaultConverters, ...liteConverters });

	let parseState: ParsedChunk['state'] = undefined as any;
	let curArgs: any[] = [];

	html.add = add;
	return { add, html, ensure, end }

	function add<E extends HTMLElement = HTMLElement> (chunk: ParsedChunk, args: ChunkInp<E>[]) {
		parseState = chunk.state;
		curArgs = args;
		addPart(chunk);
	}
	function html<E extends HTMLElement = HTMLElement> (
		parts: TemplateStringsArray, ...args: ChunkInp<E>[]
	) {
		let _parts = parts as any as string[];
		// check registry
		if (chunkRegistry.has(_parts)) return add(chunkRegistry.get(_parts)!, args);

		let chunk = parseChunk(_parts, parseState);
		chunkRegistry.set(_parts, chunk);

		add(chunk, args);
	}
	function ensure (cond: 'in_attrs' | 'in_content') {
		function check (res: boolean) {
			if (!res) throw_chunk_cond_not_met(cond);
		}

		switch (cond) {
			case 'in_attrs': check(parseState.inside === 'attrs'); break;
			case 'in_content': check(parseState.inside === 'content'); break;
		}
	}
	function end () {
		// do deferred actions if any
		for (const fn of deferedFns) fn(lastEl, comp);
		deferedFns = [];
		let chunk = build();

		// case one root element, return as root
		if (!el && chunk.children.length === 1) return chunk.children[0] as HTMLElement;
		return chunk;
	}
}

/** dump information */
export function infoDump (type: 'chunks'): Record<string, ParsedChunk>;
export function infoDump (type: 'chunks') {
	if (type === 'chunks') return Object.fromEntries(
		chunkRegistry.entries().map(([parts, chunk]) => [parts.join('${}'), chunk])
	);
	throw_undefined_info_dump_type(type);
}