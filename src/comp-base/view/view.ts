// the connection with dom

import { Event } from "../../common/event.ts";
import { query } from "../../rawdom/index.ts";
import { attachedComp, type Component } from "../core/comp.ts";
import { throw_multiple_roots } from "./errors.ts";
import { LiteNode } from "../../litedom/node.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";
import { createChunk } from "./chunk.ts";

export interface ViewOptions {
	liteConverters: Record<string, (lite: LiteNode) => Node>;
	removeEl: boolean;
}

export class View {
	comp: Component;
	el: HTMLElement;

	constructor (comp: Component, el?: HTMLElement, options: Partial<ViewOptions> = {}) {
		this.comp = comp;
		this.options = { ...(this.constructor as typeof View).defaults, ...options };
		this.el = el!;

		this.comp.el = this.el;
		if (el) (el as any)[attachedComp] = comp;

		if (this.options.removeEl) comp.onRemove.listen(() => this.el.remove());
	}
	options: ViewOptions;
	static defaults: ViewOptions = {
		liteConverters: {},
		removeEl: true
	}

	createTop () {
		const chunk = createChunk(this.comp, undefined, this.options.liteConverters);

		const end = () => {
			let el = chunk.end();
			if (el.tagName === 'NEO:TEMPLATE') throw_multiple_roots(this.comp);
			if (this.el) {
				for (const attr of el.attributes) this.el.setAttribute(attr.name, attr.value);
				this.el.replaceChildren(...el.childNodes);
			}
			else {
				this.el = el;
				(this.el as any)[attachedComp] = this.comp;
				this.comp.el = el;
			}
		}

		return { ...chunk, end }
	}

	query<T extends HTMLElement = HTMLElement> (selector: string) {
		return query<T>(selector, this.el);
	}

	createChunk (el?: HTMLElement) {
		return createChunk(this.comp, el, this.options.liteConverters);
	}

	onCleanUp = new Event<(view: this) => void>();
	cleanup () {
		// clean up effects for deattached elements
		this.comp.store.dispatcher.remove((unit) =>
			!!(unit.meta as any).el && !document.body.contains((unit.meta as any).el));
		this.onCleanUp.trigger(this);
	}

	infoDump (type: '') {
		throw_undefined_info_dump_type(type);
	}
}