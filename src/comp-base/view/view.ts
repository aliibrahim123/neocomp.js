//the connection with dom

import { Event } from "../../common/event.ts";
import { query } from "../../rawdom/index.ts";
import { attachedComp, type AnyComp, type PureComp } from "../core/comp.ts";
import { throw_into_query_no_match, throw_not_into_query } from "./errors.ts";
import type { Template } from "./templates.ts";
import { doActions, doActionsOfTemplate, type Action } from "../action/actions.ts";
import { get } from "./templates.ts";
import { toDom } from "./generation.ts";
import type { WalkOptions } from "./walker.ts";
import { walk } from "./walker.ts";
import { LiteNode } from "../../litedom/node.ts";

export interface ViewOptions {
	defaultEl: (comp: PureComp) => HTMLElement;
	template: Template;
	insertMode: InsertMode;
	into: string | undefined;
	effectHost: boolean;
	liteConverters: Record<string, (lite: LiteNode) => Node>;
	walkInPreContent: boolean;
	chunks: Record<string, Template>,
	removeEl: boolean;
}

export type InsertMode = 'asDefault' | 'replace' | 'atTop' | 'into' | 'atBottom' | 'none';

export class View <
  Refs extends Record<string, HTMLElement | HTMLElement[]> = Record<string, HTMLElement>, 
  Chunks extends string = string
> {
	comp: PureComp;
	el: HTMLElement;
	refs: Refs = {} as any;
	#chunks: Record<Chunks, Template> = {} as any;

	constructor (comp: AnyComp, el?: HTMLElement, options: Partial<ViewOptions> = {}) {
		this.comp = comp;
		this.options = { ...(this.constructor as typeof View).defaults, ...options };
		this.el = el || this.options.defaultEl(comp);

		this.comp.el = this.el;
		(this.el as any)[attachedComp] = comp;
		this.comp.refs = this.refs;
		this.#chunks = this.options.chunks;

		if (this.options.removeEl) comp.onRemove.on(() => this.el.remove());
	}
	options: ViewOptions;
	static defaults: ViewOptions = {
		defaultEl (comp) { return document.createElement('div') },
		template: get('empty'),
		insertMode: 'asDefault',
		into: undefined,
		effectHost: true,
		liteConverters: {},
		walkInPreContent: false,
		chunks: {},
		removeEl: true
	}

	initDom () {
		const el = this.el, options = this.options, template = options.template;
		//walk pre content
		if (options.walkInPreContent) this.walk(el);

		//generate from template
		let templateEl: HTMLElement = undefined as any;
		if (!(
			options.insertMode === 'none' ||
			(options.insertMode === 'asDefault' && el.childNodes.length > 0)
		)) templateEl = toDom(this.comp, template, options.liteConverters);

		//transfer attributes from template root to host element
		if (options.effectHost) for (const [attr, value] of template.node.attrs)
			if (attr !== 'id') el.setAttribute(attr, String(value));

		//do actions
		if (templateEl) this.doActions(template.actions, templateEl, {}, template.node);

		//insert into dom
		const tempInsert = options.insertMode;
		if  	(tempInsert === 'replace') 
			el.replaceChildren(...templateEl.childNodes);

		else if (tempInsert === 'asDefault' && el.childNodes.length === 0)
			el.append(...templateEl.childNodes);

		else if (tempInsert === 'atTop')
			el.prepend(...templateEl.childNodes);

		else if (tempInsert === 'atBottom')
			el.append(...templateEl.childNodes);

		else if (tempInsert === 'into') {
			if (options.into === undefined) return throw_not_into_query(this.comp);
			const into = query(options.into, this.el);
			if (into.length === 0) throw_into_query_no_match(this.comp, options.into);
			into[0].replaceChildren(...templateEl.childNodes);
		}
	}

	query <T extends HTMLElement = HTMLElement> (selector: string) {
		return query<T>(selector, this.el);
	}

	constructChunk (name: Chunks | Template, context: Record<string, any> = {}) {
		const template = typeof name === 'string' ? this.#chunks[name] : name;
		const root = toDom(this.comp, template, this.options.liteConverters);
		this.doActions(template.actions, root, context, template.node);
		return root;
	}
	getChunk (name: Chunks) {
		return this.#chunks[name];
	}

	onWalk = new Event<(view: this, el: HTMLElement, options: Partial<WalkOptions>) => void>();
	onAction = new Event<
	  (view: this, top: HTMLElement, action: Action[], context: Record<string, any>) => void
	>();
	walk (top: HTMLElement, options: Partial<WalkOptions> = {}) {
		options = { inDom: true, ...options }
		this.onWalk.trigger(this, top, options);
		this.doActions(walk(this.el, options));
	}
	doActions (
	  actions: Action[], top: HTMLElement = this.el, 
	  context: Record<string, any> = {}, lite?: LiteNode
	) {
		this.onAction.trigger(this, top, actions, context);
		if (lite) doActionsOfTemplate(this.comp, top, lite, actions, context);
		else doActions(this.comp, actions, context);
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
}