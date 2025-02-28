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
	walkInPreContent: boolean;
	removeEl: boolean;
}

export type InsertMode = 'asDefault' | 'replace' | 'atTop' | 'into' | 'atBottom' | 'none';

export class View <Refs extends Record<string, HTMLElement> = Record<string, HTMLElement>> {
	comp: PureComp;
	el: HTMLElement;
	refs: { [K in keyof Refs]: Refs[K][] } = {} as any;

	constructor (comp: AnyComp, el?: HTMLElement, options: Partial<ViewOptions> = {}) {
		this.comp = comp;
		this.options = { ...(this.constructor as typeof View).defaults, ...options };
		this.el = el || this.options.defaultEl(comp);

		this.comp.el = this.el;
		(this.el as any)[attachedComp] = comp;
		this.comp.refs = this.refs;

		if (this.options.removeEl) comp.onRemove.on(() => this.el.remove());
	}
	options: ViewOptions;
	static defaults: ViewOptions = {
		defaultEl (comp) { return document.createElement('div') },
		template: get('empty'),
		insertMode: 'asDefault',
		into: undefined,
		walkInPreContent: false,
		removeEl: true
	}

	initDom () {
		const el = this.el, template = this.options.template;
		//walk pre content
		if (this.options.walkInPreContent) this.walk(el);

		//generate from template
		let templateEl: HTMLElement = undefined as any;
		if (!(
			this.options.insertMode === 'none' ||
			(this.options.insertMode === 'asDefault' && el.childNodes.length > 0)
		)) templateEl = toDom(this.comp, template);

		//do actions
		if (templateEl) this.doActions(template.actions, templateEl, template.node);

		//insert into dom
		const tempInsert = this.options.insertMode;
		if  	(tempInsert === 'replace') 
			el.replaceChildren(...templateEl.childNodes);

		else if (tempInsert === 'asDefault' && el.childNodes.length === 0)
			el.append(...templateEl.childNodes);

		else if (tempInsert === 'atTop')
			el.prepend(...templateEl.childNodes);

		else if (tempInsert === 'atBottom')
			el.append(...templateEl.childNodes);

		else if (tempInsert === 'into') {
			if (this.options.into === undefined) return throw_not_into_query(this.comp);
			const into = query(this.options.into, this.el);
			if (into.length === 0) throw_into_query_no_match(this.comp, this.options.into);
			into[0].replaceChildren(...templateEl.childNodes);
		}
	}

	query (selector: string) {
		return query(selector, this.el);
	}

	onWalk = new Event<(view: this, el: HTMLElement, options: Partial<WalkOptions>) => void>();
	onAction = new Event<(view: this, top: HTMLElement, action: Action[]) => void>();
	walk (top: HTMLElement, options: Partial<WalkOptions> = {}) {
		options = { inDom: true, ...options }
		this.onWalk.trigger(this, top, options);
		this.doActions(walk(this.el, options));
	}
	doActions (actions: Action[], top: HTMLElement = this.el, lite?: LiteNode) {
		this.onAction.trigger(this, top, actions);
		if (lite) doActionsOfTemplate(this.comp, top, lite, actions);
		else doActions(this.comp, actions);
	}

	addRef <R extends keyof Refs> (name: R, el: Refs[R]) {
		if (name in this.refs) this.refs[name].push(el);
		else this.refs[name] = [el];
	}

	onCleanUp = new Event<(view: this) => void>();
	cleanup () {
		//clean up effects for deattached elements
		this.comp.store.dispatcher.remove((unit) => 
			!!(unit.meta as any).el && !document.body.contains((unit.meta as any).el));
		this.onCleanUp.trigger(this);
	}
}