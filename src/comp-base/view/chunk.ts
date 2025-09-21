import { builder } from "../../litedom/builder.ts";
import type { LiteNode } from "../../litedom/node.ts";
import type { parseChunk as _parseChunk, Options, ParsedChunk } from "../../litedom/parse.ts";
import { Event } from "../../common/event.ts";
import { attachedComp, Component } from "../core/comp.ts";
import { Signal } from "../state/signal.ts";
import { throw_chunk_cond_not_met } from "./errors.ts";

// import parseChunk if specified
let parseChunk = undefined as any as typeof _parseChunk;
if ((globalThis as any).__neocomp_enable_chunk_parsing === true)
	parseChunk = (await import("../../litedom/parse.ts")).parseChunk;

const chunkRegistry = new Map<string[], ParsedChunk>();

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

type Action = {
	argInd: number
} & ({
	type: 'attrs' | 'content'
} | {
	type: 'attr'
	attr: string
});

export let isDefered = Symbol('neocomp:defered-fn');

function setAttr (el: HTMLElement, attr: string, value: any) {
	// property
	if (attr[0] === '.') (el as any)[attr.slice(1)] = value;
	// style property
	else if (attr.startsWith('style:')) el.style.setProperty(attr.slice(6), value);
	// style map
	else if (attr === 'style') Object.assign(el.style, value);
	// class
	else if (attr.startsWith('class:')) el.classList.toggle(attr.slice(6), !!value);
	// class map
	else if (attr === 'class')
		for (const name in value) el.classList.toggle(name, !!value[name]);
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
	// bind signal
	else if (value instanceof Signal) comp.store.effect([value], [],
		() => setAttr(el, attr, value.value)
		, undefined, { el });
	// bind computed exp
	else if (typeof (value) === 'function')
		comp.store.effect(() => setAttr(el, attr, value()), undefined, { el });
	// static attribute
	else setAttr(el, attr, value);
}
function setContent (el: HTMLElement, target: ChildNode, comp: Component, value: any) {
	let newTarget: ChildNode;
	// component
	if (value.onInit instanceof Event) {
		if (value.status === 'inited') {
			comp.addChild(value);
			newTarget = value.el;
		} else {
			newTarget = document.createElement('span');
			(value as Component).onInit.listen(child => {
				if (!newTarget.parentElement) return;
				comp.addChild(child);
				newTarget.replaceWith(child.el);
			});
		}
	}
	// node
	else if (value instanceof Node) newTarget = value as ChildNode;
	// falsy value, empty string as placeholder
	else if (!value) newTarget = new Text('');
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
				arg(el, comp);
			}
			// atribute map
			else for (const attr in arg) handleAttr(el, comp, attr, arg[attr]);
		}

		// content
		else {
			let target = el.querySelector('stop-target') as ChildNode;
			// static text
			if (typeof (arg) === 'string') {
				let el = document.createElement('span');
				el.innerText = arg;
				target.replaceWith(...el.childNodes)
			}
			// node array
			else if (arg.length !== undefined && arg[0] instanceof Node)
				target.replaceWith(...arg);
			// bind signal 
			else if (arg instanceof Signal) comp.store.effect([arg], [],
				() => target = setContent(el, target, comp, arg.value),
				undefined, { el });
			// bind computed epx
			else if (typeof (arg) === 'function') comp.store.effect(
				() => target = setContent(el, target, comp, arg(el, comp)),
				undefined, { el });
			// static content
			else setContent(el, target, comp, arg);
		}
	}
}

export function createChunk (
	comp: Component, el?: HTMLElement, liteConverters: Record<string, (lite: LiteNode) => Node> = {}
) {
	let deferedFns: ((el: HTMLElement, comp: Component) => void)[] = [];
	let lastEl: HTMLElement;

	let [addPart, build] = builder(el || 'neo:template', (lite, el) => {
		// deferred actions
		if (lastEl !== el) for (const fn of deferedFns) fn(lastEl, comp);
		lastEl = el;

		// actions
		let actions = lite.meta.get('actions');
		if (actions) doActions(el, comp, actions, curArgs, deferedFns);
	}, liteConverters);

	let parseState: ParsedChunk['state'] = undefined as any;
	let curArgs: any[] = [];

	return { add, $temp, $ensure, end }

	function add (chunk: ParsedChunk, args: any[]) {
		parseState = chunk.state;
		curArgs = args;
		addPart(chunk);
	}
	function $temp (parts: string[], ...args: any[]) {
		// check registry
		if (chunkRegistry.has(parts)) return add(chunkRegistry.get(parts)!, args);

		// build
		var chunk = parseChunk(parts, parseOptions, parseState);
		// gather actions at stops
		for (const [ind, stop] of chunk.stops.entries()) {
			var action: Action = stop.at === 'attr' ?
				{ type: 'attr', attr: stop.attr, argInd: ind } :
				{ type: stop.at, argInd: ind };

			if (stop.node.meta.has('actions'))
				stop.node.meta.get('actions').push(action);
			else stop.node.meta.set('actions', [action]);
		}

		add(chunk, args);
	}
	function $ensure (cond: 'in_attrs' | 'in_content') {
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
		let chunk = build();

		// case one root element, return as root
		if (!el && chunk.children.length === 1) return chunk.children[0] as HTMLElement;
		return chunk;
	}
}