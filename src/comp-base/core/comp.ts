//the component class

import { Event, OTIEvent } from "../../common/event.ts";
import type { fn } from "../../common/types.ts";
import { Store } from "../state/store.ts";
import type { StoreOptions } from "../state/store.ts";
import { View } from "../view/view.ts";
import type { ViewOptions } from "../view/view.ts";
import { 
	throw_link_Parent_while_has, throw_no_initFn, throw_unlink_unowned_child, throw_unlink_no_parent, 
	throw_removing_removed_comp, throw_incorrect_init_sequence, throw_linking_same,
	throw_unlinking_not_linked
} from "./errors.ts";
import { onNew, onRemove } from "./globalEvents.ts";
import { link, unlink } from "./linkable.ts";
import type { Linkable } from "./linkable.ts";
import { addToIdMap, registry, removeFromIdMap, removeRoot } from "./registry.ts";
import type { BaseMap } from "./typemap.ts";

const status = {
	preInit: Symbol('neocomp:status.pre-init'),
	coreInit: Symbol('neocomp:status.core-init'),
	initDom: Symbol('neocomp:status.dom-init'),
	inited: Symbol('neocomp:status.inited'),
	removing: Symbol('neocomp:status.removing'),
	removed: Symbol('neocomp:status.removed'),
} as const;

const initMode = {
	minimal: Symbol('neocomp:initMode.minimal'),
	standared: Symbol('neocomp:initMode.standared'),
	fullControl: Symbol('neocomp:initMode.fullControl')
} as const;

export type CompOptions = {
	initMode: symbol;
	anonymous: boolean;
	defaultId: () => string;
	removeChildren: boolean;
	store: Partial<StoreOptions>;
	view: Partial<ViewOptions>;
}

export const attachedComp = Symbol('neocomp:attached-comp');

export class Component <TMap extends BaseMap> implements Linkable {
	typemap = undefined as any as TMap;

	constructor (el?: HTMLElement) {
		this.options = (this.constructor as typeof Component).defaults;
		this.el = el as HTMLElement;
		this.id = el?.id || this.options.defaultId();

		if (this.options.initMode !== initMode.fullControl) this.initCore();
		if (this.options.initMode === initMode.minimal) {
			this.initDom();
			this.init();
			this.fireInit();
		}
		else this.init();
	}
	
	id: string = '';
	status: symbol = status.preInit;
	static status = status;
	static initMode = initMode;
	options: CompOptions;
	static defaults: CompOptions = {
		anonymous: false,
		defaultId: () => '',
		removeChildren: true,
		initMode: initMode.standared,
		store: {},
		view: {}
	}
	
	initCore () {
		if (this.status !== status.preInit) 
			throw_incorrect_init_sequence(this, status.coreInit, this.status);
		this.status = status.coreInit;

		this.store = new Store(this, this.options.store);
		this.view = new View(this, this.el, this.options.view);
	}
	initDom () {
		if (this.status !== status.coreInit) 
			throw_incorrect_init_sequence(this, status.initDom, this.status);
		this.status = status.initDom;

		this.view.initDom();
		this.onDomInit.trigger(this);
	}
	fireInit () {
		if (this.status !== status.initDom) 
			throw_incorrect_init_sequence(this, status.inited, this.status);
		this.status = status.inited;

		this.onInitInternal.trigger(this);
		this.onInit.trigger(this);
		if (!this.options.anonymous) {
			addToIdMap(this.id, this);
			onNew.trigger(this);
		}
	}
	onDomInit = new OTIEvent<(comp: this) => void>();
	onInitInternal = new OTIEvent<(comp: this) => void>();
	onInit = new OTIEvent<(comp: this) => void>();
	init () {
		throw throw_no_initFn(this);
	}

	store: Store<TMap['props']> = undefined as any;
	get <P extends keyof TMap['props'] & string> (name: P | symbol) {
		return this.store.get(name)
	}
	set <P extends keyof TMap['props'] & string> (name: P | symbol, value: TMap['props'][P]) {
		this.store.set(name, value)
	}
	signal <P extends keyof TMap['props'] & string> (name: P | symbol, value?: TMap['props'][P]) {
		return this.store.createSignal(name, value);
	}
	effect (
		effectedBy: ((keyof TMap['props'] & string) | symbol)[], handler: () => void,
		effect: ((keyof TMap['props'] & string) | symbol)[] = []
	) { this.store.addEffect(effectedBy, handler, effect) }

	view: View<TMap['refs']> = undefined as any;
	el: HTMLElement;
	refs: { [K in keyof TMap['refs']]: TMap['refs'][K][] } = undefined as any;
	query (selector: string) { return this.view.query(selector) }

	onLink = new Event<(comp: this, linked: Linkable) => void>();
	onUnlink = new Event<(comp: this, unlinked: Linkable) => void>();
	#links = new Set<Linkable>();
	link (other: Linkable): void {
		if (this.#links.has(other)) throw_linking_same(this, other);
		this.#links.add(other);
		this.onLink.trigger(this, other);
	}
	unlink (other: Linkable): void {
		if (!this.#links.has(other)) throw_unlinking_not_linked(this, other);
		this.#links.delete(other);
		this.onUnlink.trigger(this, other);
	}
	linkTo (other: Linkable) {
		link(this, other);
	}
	unlinkTo (other: Linkable) {
		unlink(this, other);
	}
	hasLink (other: Linkable): boolean {
		return this.#links.has(other);
	}

	onChildAdded = new Event<(comp: this, child: AnyComp) => void>();
	onAddedToParent = new Event<(comp: this, parent: AnyComp) => void>();
	onUnlinkedFromParent = new Event<(comp: this, parent: AnyComp) => void>();
	onChildUnlink = new Event<(comp: this, child: AnyComp) => void>();
	parent?: AnyComp;
	children: AnyComp[] = [];
	childmap: TMap['childmap'] = {};
	addChild (child: AnyComp, ind = -1) {
		//add
		if (ind === -1) this.children.push(child);
		else this.children.splice(ind, 0, child);
		(this.childmap[child.id] as any) = child;

		//trigger events
		this.onChildAdded.trigger(this, child);
		child.linkParent(this);
	}
	linkParent (parent: AnyComp) {
		if (this.parent) throw_link_Parent_while_has(this, this.parent);
		this.parent = parent;
		this.onAddedToParent.trigger(this, parent);
	}
	unlinkParent () {
		if (!this.parent) throw_unlink_no_parent(this);
		this.parent?.unlinkChild(this);
		this.onUnlinkedFromParent.trigger(this, this.parent as AnyComp);
		this.parent = undefined;
	}
	unlinkChild (child: AnyComp) {
		let childCount = this.children.length;
		this.children = this.children.filter(_child => _child !== child);
		(this.childmap[child.id] as any) = undefined;
		if (childCount === this.children.length) throw_unlink_unowned_child(this, child);
		this.onChildUnlink.trigger(this, child);
	}

	onRemove = new Event<(comp: this) => void>();
	remove () {
		if (this.status === status.removed) throw_removing_removed_comp(this);
		if (this.status === status.removing) return;
		this.status = status.removing;
		this.onRemove.trigger(this);

		//links
		for (const link of this.#links) {
			link.unlink(this);
			this.onUnlink.trigger(this, link);
		}
		this.#links = new Set;

		//parent
		if (this.parent) {
			this.parent.unlinkChild(this);
			this.parent = undefined;
		}

		//children
		for (const child of this.children) {
			if (this.options.removeChildren) child.remove();
			else child.unlinkParent();
		}
		this.children = [];

		//globally
		if (!this.options.anonymous) {
			removeFromIdMap(this.id);
			onRemove.trigger(this);
		}

		//root
		if (registry.root === this) removeRoot();
		
		this.status = status.removed;
	}
}

export type PureComp = Component<BaseMap>;
export type AnyComp = {
	[k in keyof Component<any>]: 
	  Component<any>[k] extends Event<fn> ? Event<fn> :
	  Component<any>[k] extends OTIEvent<fn> ? OTIEvent<fn> :
	  Component<any>[k]
};