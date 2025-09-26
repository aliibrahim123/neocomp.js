// the connection with dom

import { Event } from "../../common/event.ts";
import { query } from "../../rawdom/index.ts";
import { attachedComp, type Component } from "../core/comp.ts";
import { throw_multiple_roots } from "./errors.ts";
import { LiteNode } from "../../litedom/node.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";
import { createChunk, type ChunkBuild } from "./chunk.ts";
import type { Prop } from "../state/store.ts";
import { unlink, type Linkable } from "../core/linkable.ts";

export interface ViewOptions {
	liteConverters: Record<string, (lite: LiteNode) => Node>;
	removeEl: boolean;
}

interface Chunk {
	props: number[],
	links: Linkable[],
	childs: Component[],
	chunks: Chunk[],
	remove: () => void
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

	#chunksInRemoving = 0;
	createChunk (el?: HTMLElement, destroyable?: false): ChunkBuild;
	createChunk (el?: HTMLElement, destroyable?: true): ChunkBuild & { remove: () => void };
	createChunk (el?: HTMLElement, destroyable = false) {
		let build = createChunk(this.comp, el, this.options.liteConverters);
		if (!destroyable) return build;

		let chunk: Chunk = { props: [], links: [], childs: [], chunks: [], remove: undefined as any };
		// add watchers
		if (this.#chunkStack.length === 0) {
			this.comp.store.onAdd.listen(this.#_watchProps);
			this.comp.onLink.listen(this.#_watchLinks);
			this.comp.onUnlink.listen(this.#_watchUnlinks);
			this.comp.onChildAdded.listen(this.#_watchChilds);
			this.comp.onChildUnlink.listen(this.#_watchChildUnlinks);
		}
		// push chunk to its parent
		this.#chunkStack.at(-1)?.chunks.push(chunk);

		this.#chunkStack.push(chunk);

		let chunkEl: HTMLElement;
		const end = () => {
			this.#chunkStack.pop();
			// remove watchers
			if (this.#chunkStack.length === 0) {
				this.comp.store.onAdd.unlisten(this.#_watchProps);
				this.comp.onLink.unlisten(this.#_watchLinks);
				this.comp.onUnlink.unlisten(this.#_watchUnlinks);
				this.comp.onChildAdded.unlisten(this.#_watchChilds);
				this.comp.onChildUnlink.unlisten(this.#_watchChildUnlinks);
			}
			// build
			chunkEl = build.end();
			return chunkEl
		}
		const remove = () => {
			this.#chunksInRemoving++;

			chunkEl.remove();
			// remove associated items
			if (chunk.props.length > 0) this.comp.store.dispatcher.remove(chunk.props);
			if (chunk.links.length > 0) this.comp.store.dispatcher.remove(chunk.links);
			for (const prop of chunk.props) this.comp.store.remove(prop);
			for (const link of chunk.links) unlink(this.comp, link);
			for (const child of chunk.childs) child.remove();
			for (const childChunk of chunk.chunks) childChunk.remove();

			this.#chunksInRemoving--;
			if (this.#chunksInRemoving === 0) this.cleanup();
		}
		chunk.remove = remove;
		return { ...build, end, remove };
	}
	#chunkStack: Chunk[] = [];
	// watchers for chunk associated items
	#_watchProps = this.#watchProps.bind(this);
	#_watchLinks = this.#watchLinks.bind(this);
	#_watchUnlinks = this.#watchUnlinks.bind(this);
	#_watchChilds = this.#watchChilds.bind(this);
	#_watchChildUnlinks = this.#watchChildUnlinks.bind(this);
	#watchProps (_: any, prop: Prop) {
		this.#chunkStack.at(-1)?.props.push(prop.id);
	}
	#watchLinks (_: any, linked: Linkable) {
		this.#chunkStack.at(-1)?.links.push(linked);
	}
	#watchUnlinks (_: any, linked: Linkable) {
		let chunk = this.#chunkStack.at(-1)!;
		chunk.links.splice(chunk.links.indexOf(linked), 1);
	}
	#watchChilds (_: any, child: Component) {
		this.#chunkStack.at(-1)?.childs.push(child);
	}
	#watchChildUnlinks (_: any, child: Component) {
		let chunk = this.#chunkStack.at(-1)!;
		chunk.childs.splice(chunk.childs.indexOf(child), 1);
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