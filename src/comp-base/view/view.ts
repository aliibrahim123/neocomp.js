//the connection with dom

import { Event } from "../../common/event.ts";
import { query } from "../../rawdom/index.ts";
import { attachedComp, Component, type PureComp } from "../core/comp.ts";
import { throw_into_query_no_match, throw_not_into_query, throw_undefined_chunk } from "./errors.ts";
import type { Template } from "./templates.ts";
import { doActionsFromDom, doActionsOfTemplate, type Action } from "../action/actions.ts";
import { toDom } from "./toDom.ts";
import { LiteNode } from "../../litedom/node.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";

export interface ViewOptions {
	defaultEl: (comp: PureComp) => HTMLElement;
	insertMode: InsertMode;
	effectHost: boolean;
	liteConverters: Record<string, (lite: LiteNode) => Node>;
	removeEl: boolean;
}

type InsertMode = 
	'asDefault' | 'replace' | 'atTop' | 'atBottom' | 'none' | { type: 'into', target: string };

export class View <
  Refs extends Record<string, HTMLElement | HTMLElement[]> = Record<string, HTMLElement>, 
  Chunks extends string = string
> {
	comp: PureComp;
	el: HTMLElement;
	refs: Refs = {} as any;
	#chunks: Record<Chunks, Template> = {} as any;

	constructor (comp: PureComp, el?: HTMLElement, options: Partial<ViewOptions> = {}) {
		this.comp = comp;
		this.options = { ...(this.constructor as typeof View).defaults, ...options };
		this.el = el || this.options.defaultEl(comp);

		this.comp.el = this.el;
		(this.el as any)[attachedComp] = comp;
		this.comp.refs = this.refs;
		this.#chunks = (comp.constructor as typeof Component).chunks;

		if (this.options.removeEl) comp.onRemove.listen(() => this.el.remove());
	}
	options: ViewOptions;
	static defaults: ViewOptions = {
		defaultEl (comp) { return document.createElement('div') },
		insertMode: 'atBottom',
		effectHost: true,
		liteConverters: {},
		removeEl: true
	}

	initDom () {
		const el = this.el, options = this.options;
		const template = (this.comp.constructor as typeof Component).template;

		//generate from template
		let templateEl: HTMLElement = undefined as any;
		if (!(
			options.insertMode === 'none' ||
			(options.insertMode === 'asDefault' && el.childNodes.length > 0)
		)) templateEl = toDom(this.comp, template, options.liteConverters);

		//transfer attributes from template root to host element
		if (options.effectHost) for (const [attr, value] of template.root.attrs)
			if (attr !== 'id') el.setAttribute(attr, String(value));

		//do actions
		if (templateEl) this.doActions(template.actions, {}, templateEl, template.root);

		//insert into dom
		const insertMode = options.insertMode;
		if  	(insertMode === 'replace') 
			el.replaceChildren(...templateEl.childNodes);

		else if (insertMode === 'asDefault' && el.childNodes.length === 0)
			el.append(...templateEl.childNodes);

		else if (insertMode === 'atTop')
			el.prepend(...templateEl.childNodes);

		else if (insertMode === 'atBottom')
			el.append(...templateEl.childNodes);

		else if (typeof(insertMode) !== 'string' && insertMode.type === 'into') { 
			const into = query(insertMode.target, this.el);
			if (into.length === 0) throw_into_query_no_match(this.comp, insertMode.target);
			into[0].replaceChildren(...templateEl.childNodes);
		}
	}

	query <T extends HTMLElement = HTMLElement> (selector: string) {
		return query<T>(selector, this.el);
	}

	constructChunk (name: Chunks | Template, context: Record<string, any> = {}) {
		const template = typeof name === 'string' ? this.#chunks[name] : name;
		if (!template) throw_undefined_chunk(this.comp, name as string);
		const root = toDom(this.comp, template, this.options.liteConverters);
		this.doActions(template.actions, context, root, template.root);
		return root;
	}
	getChunk (name: Chunks): Template {
		const chunk = this.#chunks[name];
		if (!chunk) throw_undefined_chunk(this.comp, name);
		return chunk;
	}

	onAction = new Event<
	  (view: this, top: HTMLElement, actions: Action[], context: Record<string, any>) => void
	>();
	doActions (
	  actions: Action[],  context: Record<string, any> = {},
	  top: HTMLElement = this.el, lite?: LiteNode
	) {
		this.onAction.trigger(this, top, actions, context);
		if (lite) doActionsOfTemplate(this.comp, top, lite, actions, context);
		else doActionsFromDom(this.comp, actions, context);
	}

	addRef <R extends keyof Refs> (name: R, el: Refs[R]) {
		if (name in this.refs) {
			if (Array.isArray(this.refs[name])) this.refs[name].push(...el as HTMLElement[]);
			else this.refs[name] = el;
		}
		else this.refs[name] = el;
	}

	onCleanUp = new Event<(view: this) => void>();
	cleanup () {
		//clean up effects for deattached elements
		this.comp.store.dispatcher.remove((unit) => 
			!!(unit.meta as any).el && !document.body.contains((unit.meta as any).el));
		this.onCleanUp.trigger(this);
	}

	infoDump (type: 'chunks'): Record<Chunks, Template>; 
	infoDump (type: 'chunks') {
		if (type === 'chunks') return { ...this.#chunks };
		throw_undefined_info_dump_type(type);
	}
}