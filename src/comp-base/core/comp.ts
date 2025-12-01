// the component class

import { Event, OTIEvent } from "../../common/event.ts";
import { Store } from "../state/store.ts";
import type { EffectedProp, EffectingProp, PropId, StoreOptions } from "../state/store.ts";
import { View } from "../view/view.ts";
import type { ViewOptions } from "../view/view.ts";
import {
	throw_link_Parent_while_has, throw_unlink_unowned_child, throw_unlink_no_parent,
	throw_removing_removed_comp, throw_incorrect_init_sequence, throw_linking_linked,
	throw_unlinking_not_linked, throw_adding_child_out_of_range,
	throw_undefined_info_dump_type
} from "./errors.ts";
import { onNew, onRemove } from "./globalEvents.ts";
import type { DataSource, Linkable } from "./linkable.ts";
import { addToIdMap, registry, removeFromIdMap, removeRoot } from "./registry.ts";
import type { ReadOnlySignal, Signal } from "../state/signal.ts";
import type { ChunkBuild } from "../core.ts";
import type { ChunkInp } from "../view/chunk.ts";

/** status of the component */
export type Status = 'coreInit' | 'domInit' | 'inited' | 'removing' | 'removed';

/** options for `Comp` */
export type CompOptions = {
	/** do not notify global systems, default `false` */
	anonymous: boolean;
	/** default id in case no one is provided */
	defaultId: (comp: Component) => string;
	/** remove children on remove */
	removeChildren: boolean;
	/** options for `Store` */
	store: Partial<StoreOptions>;
	/** options for `View` */
	view: Partial<ViewOptions>;
}

/** symbol on top elements refering to the attached component */
export const attachedComp = Symbol('neocomp:attached-comp');

/** the base unit of the UI */
export class Component implements DataSource {
	constructor (el?: HTMLElement) {
		this.options = (this.constructor as typeof Component).defaults;
		this.el = el as HTMLElement;
		this.name = el?.getAttribute('neo:name') || '';
		this.id = el?.id || this.options.defaultId(this);

		this.store = new Store(this, this.options.store);
		this.view = new View(this, this.el, this.options.view);
	}

	/** a globally unique identifier for the component */
	id: string = '';
	/** a human readable name of the component */
	name: string = '';
	/** the status of the component */
	status: Status = 'coreInit';
	/** the options of the component */
	options: CompOptions;
	/** the default options of all components */
	static defaults: CompOptions = {
		anonymous: false,
		defaultId: (comp) => comp.name ?
			`${comp.name}-${Math.round(Math.random() * 1000)}`
			: String(Math.round(Math.random() * 1000000000)),
		removeChildren: true,
		store: {},
		view: {}
	}

	#endTop?: () => void;
	/** start top element chunk building */
	createTop () {
		if (this.status !== 'coreInit')
			throw_incorrect_init_sequence(this, 'domInit', this.status);
		this.status = 'domInit';

		const chunk = this.view.createTop();
		this.#endTop = () => {
			chunk.end();
			this.#endTop = undefined;
		}
		return { ...chunk, end: this.#endTop as ChunkBuild['end'] };
	}
	/** finish initialization and notify the world */
	fireInit () {
		if (this.status !== 'domInit')
			throw_incorrect_init_sequence(this, 'inited', this.status);

		if (this.#endTop) this.#endTop();

		this.status = 'inited';

		this.onInitInternal.trigger(this);
		this.onInit.trigger(this);
		if (!this.options.anonymous) {
			addToIdMap(this.id, this);
			onNew.trigger(this as any);
		}
	}
	/** event triggered after initialization, for internal use */
	onInitInternal = new OTIEvent<(comp: this) => void>();
	/** event triggered after initialization */
	onInit = new OTIEvent<(comp: this) => void>();

	/** the store of the component */
	store: Store = undefined as any;
	/** get property of id */
	get<T = any> (id: PropId<T> | number) {
		return this.store.get(id);
	}
	/** set property of id */
	set<T = any> (id: PropId<T> | number, value: T) {
		this.store.set(id, value);
	}
	/** create a new signal, of optionally default value */
	signal<T = any> (value?: T) {
		return this.store.signal(value);
	}
	/** create a computed property */
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[] | (() => T), fn?: () => T) {
		return this.store.computed(effectedBy as any, fn!);
	}
	/** attach an effect */
	effect (handler: () => void): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[], handler: () => void
	): void;
	effect (
		a: EffectingProp[] | (() => void),
		b: EffectedProp[] | Linkable | undefined = undefined, c?: () => void,
	) {
		this.store.effect(a as any, b as any, c);
	}

	/** the view of the component */
	view: View = undefined as any;
	/** the top element */
	el: HTMLElement;
	/** query all element of specific selector */
	query<T extends HTMLElement = HTMLElement> (selector: string) { return this.view.query<T>(selector) }
	/** create a chunk */
	chunk (el?: HTMLElement): ChunkBuild;
	chunk (builder: (build: ChunkBuild) => void): HTMLElement;
	chunk (el?: HTMLElement | ((build: ChunkBuild) => void)) {
		if (typeof (el) === 'function') {
			let build = this.view.createChunk();
			el(build);
			return build.end();
		}
		return this.view.createChunk(el)
	}
	/** templated function creating a chunk */
	$chunk<E extends HTMLElement = HTMLElement> (parts: TemplateStringsArray, ...args: ChunkInp<E>[]) {
		let build = this.view.createChunk();
		build.$temp(parts, ...args);
		return build.end();
	}

	onLink = new Event<(comp: this, linked: Linkable) => void>();
	onUnlink = new Event<(comp: this, unlinked: Linkable) => void>();
	#links = new Set<Linkable>();
	link (other: Linkable): void {
		if (this.#links.has(other)) throw_linking_linked(this, other);
		this.#links.add(other);
		this.onLink.trigger(this, other);
	}
	unlink (other: Linkable): void {
		if (!this.#links.has(other)) throw_unlinking_not_linked(this, other);
		this.#links.delete(other);
		this.onUnlink.trigger(this, other);
	}
	hasLink (other: Linkable): boolean {
		return this.#links.has(other);
	}

	/** event triggered when a child is added */
	onChildAdded = new Event<(comp: this, child: Component) => void>();
	/** event triggered when linked to parent */
	onAddedToParent = new Event<(comp: this, parent: Component) => void>();
	/** event triggered when unlinked from parent */
	onUnlinkedFromParent = new Event<(comp: this, parent: Component) => void>();
	/** event triggered when a child is removed */
	onChildUnlink = new Event<(comp: this, child: Component) => void>();
	/** the component owning the component */
	parent: Component = undefined as any;
	/** the compoents owned by the component */
	children: Component[] = [];
	/** add a component as a child */
	addChild (child: Component, ind = -1) {
		// add
		if ((ind < 0 ? -ind - 1 : ind) > this.children.length)
			throw_adding_child_out_of_range(this, child, ind);
		if (ind === -1) this.children.push(child);
		else this.children.splice(ind, 0, child);

		// trigger events
		this.onChildAdded.trigger(this, child);
		child.linkParent(this);
	}
	/** link a parent */
	linkParent (parent: Component) {
		if (this.parent) throw_link_Parent_while_has(this, this.parent);
		this.parent = parent;
		this.onAddedToParent.trigger(this, parent);
	}
	/** unlink the parent */
	unlinkParent () {
		if (!this.parent) throw_unlink_no_parent(this);
		this.parent?.unlinkChild(this);
		this.onUnlinkedFromParent.trigger(this, this.parent);
		this.parent = undefined as any;
	}
	/** unlink a child */
	unlinkChild (child: Component) {
		let childCount = this.children.length;
		this.children = this.children.filter(_child => _child !== child);
		if (childCount === this.children.length) throw_unlink_unowned_child(this, child);
		this.onChildUnlink.trigger(this, child);
	}

	/** event triggered on removal */
	onRemove = new Event<(comp: this) => void>();
	/** remove the component from all systems */
	remove () {
		if (this.status === 'removed') throw_removing_removed_comp(this);
		if (this.status === 'removing') return;
		this.status = 'removing';
		this.onRemove.trigger(this);

		// links
		for (const linkable of this.#links) {
			linkable.unlink(this);
			this.onUnlink.trigger(this, linkable);
		}
		this.#links = new Set;

		// parent
		if (this.parent) this.unlinkParent();

		// children
		for (const child of this.children) {
			if (this.options.removeChildren) child.remove();
			else child.unlinkParent();
		}
		this.children = [];

		// dom
		delete (this.el as any)[attachedComp];

		// globally
		if (!this.options.anonymous) {
			removeFromIdMap(this.id);
			onRemove.trigger(this);
		}

		// root
		if (registry.root === this) removeRoot();

		this.status = 'removed';
	}

	/** dump information about the component */
	infoDump (type: 'links'): Linkable[];
	infoDump (type: 'properties'): Record<number, any>;
	infoDump (type: 'links' | 'properties') {
		if (type === 'links') return Array.from(this.#links);
		if (type === 'properties') return this.store.infoDump('values');
		throw_undefined_info_dump_type(type);
	}
}