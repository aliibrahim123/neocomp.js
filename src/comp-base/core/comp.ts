//the component class

import { Event, OTIEvent } from "../../common/event.ts";
import { get, type Template } from "../view/templates.ts";
import { Store } from "../state/store.ts";
import type { EffectedProp, StoreOptions } from "../state/store.ts";
import { View } from "../view/view.ts";
import type { ViewOptions } from "../view/view.ts";
import { 
	throw_link_Parent_while_has, throw_unlink_unowned_child, throw_unlink_no_parent, 
	throw_removing_removed_comp, throw_incorrect_init_sequence, throw_linking_linked,
	throw_unlinking_not_linked, throw_adding_child_out_of_range,
	throw_undefined_info_dump_type
} from "./errors.ts";
import { onNew, onRemove } from "./globalEvents.ts";
import type { Linkable } from "./linkable.ts";
import { addToIdMap, registry, removeFromIdMap, removeRoot } from "./registry.ts";
import type { BaseMap } from "./typemap.ts";
import { passedArgs } from "../action/attr.ts";

export type Status = 'coreInit' | 'domInit' | 'inited' | 'removing' | 'removed';

export type CompOptions = {
	anonymous: boolean;
	defaultId: (comp: PureComp) => string;
	removeChildren: boolean;
	store: Partial<StoreOptions>;
	view: Partial<ViewOptions>;
}

export const attachedComp = Symbol('neocomp:attached-comp');

export class Component <TMap extends BaseMap> implements Linkable {
	//extracting a parameter type from a generic requires to use that parameter in the generic
	//if __tmap is not wraped with this optionals, errors will flood the project
	//DO NOT TOUCH !!!
	//hours spent: NaN
	#__tmap: Partial<TMap> | undefined;

	constructor (el?: HTMLElement, initMode: 'core' | 'dom' | 'full' = 'core') {
		this.options = (this.constructor as typeof Component).defaults;
		this.el = el as HTMLElement;
		this.name = el?.getAttribute('neo:name') || '';
		this.id = el?.id || this.options.defaultId(this);

		this.store = new Store(this, this.options.store);
		this.view = new View(this, this.el, this.options.view);

		if (initMode !== 'core') this.initDom();
		if (initMode === 'full') this.fireInit();
	}
	
	id: string = '';
	name: string = '';
	status: Status = 'coreInit';
	options: CompOptions;
	static defaults: CompOptions = {
		anonymous: false,
		defaultId: (comp) => comp.name ? 
			`${comp.name}-${Math.round(Math.random() * 1000)}` 
			: String(Math.round(Math.random() * 1000000000)),
		removeChildren: true,
		store: {},
		view: {}
	}
	
	elementArgs () {
		const args: Record<string, any> = (this.el as any)[passedArgs];
		delete (this.el as any)[passedArgs];
		return args;

	}
	initDom () {
		if (this.status !== 'coreInit') 
			throw_incorrect_init_sequence(this, 'domInit', this.status);
		this.status = 'domInit';

		this.view.initDom();
		this.onDomInit.trigger(this);
	}
	fireInit () {
		if (this.status !== 'domInit') 
			throw_incorrect_init_sequence(this, 'inited', this.status);
		this.status = 'inited';

		this.onInitInternal.trigger(this);
		this.onInit.trigger(this);
		if (!this.options.anonymous) {
			addToIdMap(this.id, this);
			onNew.trigger(this as any);
		}
	}
	onDomInit = new OTIEvent<(comp: this) => void>();
	onInitInternal = new OTIEvent<(comp: this) => void>();
	onInit = new OTIEvent<(comp: this) => void>();
	
	store: Store<TMap['props']> = undefined as any;
	get <P extends keyof TMap['props'] & string> (name: P | symbol) {
		return this.store.get(name)
	}
	set <P extends keyof TMap['props'] & string> (name: P | symbol, value: TMap['props'][P]) {
		this.store.set(name, value)
	}
	setMultiple (props: Partial<TMap['props']>) {
		this.store.setMultiple(props)
	}
	signal <P extends keyof TMap['props'] & string> (name: P | symbol, Default?: TMap['props'][P]) {
		return this.store.createSignal(name, Default);
	}
	computed <P extends keyof TMap['props'] & string> (
		name: P | symbol, effectedBy: EffectedProp<TMap['props']>[] | 'track', fn: () => TMap['props'][P]
	) {
		return this.store.computed(name, effectedBy, fn);
	}
	effect (
		effectedBy: EffectedProp<TMap['props']>[], handler: () => void,
		effect?: EffectedProp<TMap['props']>[]
	): void;
	effect (track: 'track', handler: () => void): void;
	effect (
		effectedBy: EffectedProp<TMap['props']>[] | 'track', handler: () => void,
		effect: EffectedProp<TMap['props']>[] = []
	) { 
		if (effectedBy === 'track') this.store.addEffect('track', handler);
		else this.store.addEffect(effectedBy, handler, effect);
	}

	view: View<TMap['refs'], TMap['chunks']> = undefined as any;
	el: HTMLElement;
	static template = get('empty');
	static chunks: Record<string, Template> = {};
	refs: TMap['refs'] = undefined as any;
	query <T extends HTMLElement = HTMLElement> (selector: string) { return this.view.query<T>(selector) }
	chunk (chunk: TMap['chunks'] | Template, context?: Record<string, any>) 
	  { return this.view.constructChunk(chunk, context) }

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

	onChildAdded = new Event<(comp: this, child: PureComp) => void>();
	onAddedToParent = new Event<(comp: this, parent: PureComp) => void>();
	onUnlinkedFromParent = new Event<(comp: this, parent: PureComp) => void>();
	onChildUnlink = new Event<(comp: this, child: PureComp) => void>();
	parent: PureComp = undefined as any;
	children: PureComp[] = [];
	childmap: TMap['childmap'] = {};
	addChild (child: PureComp, ind = -1) {
		//add
		if ((ind < 0 ? -ind-1 : ind ) > this.children.length) 
			throw_adding_child_out_of_range(this, child, ind);
		if (ind === -1) this.children.push(child);
		else this.children.splice(ind, 0, child);
		if (child.name) (this.childmap[child.name] as any) = child;

		//trigger events
		this.onChildAdded.trigger(this, child);
		child.linkParent(this);
	}
	linkParent (parent: PureComp) {
		if (this.parent) throw_link_Parent_while_has(this, this.parent);
		this.parent = parent;
		this.onAddedToParent.trigger(this, parent);
	}
	unlinkParent () {
		if (!this.parent) throw_unlink_no_parent(this);
		this.parent?.unlinkChild(this);
		this.onUnlinkedFromParent.trigger(this, this.parent);
		this.parent = undefined as any;
	}
	unlinkChild (child: PureComp) {
		let childCount = this.children.length;
		this.children = this.children.filter(_child => _child !== child);
		if (child.name) (this.childmap[child.name] as any) = undefined;
		if (childCount === this.children.length) throw_unlink_unowned_child(this, child);
		this.onChildUnlink.trigger(this, child);
	}

	onRemove = new Event<(comp: this) => void>();
	remove () {
		if (this.status === 'removed') throw_removing_removed_comp(this);
		if (this.status === 'removing') return;
		this.status = 'removing';
		this.onRemove.trigger(this);

		//links
		for (const linkable of this.#links) {
			linkable.unlink(this);
			this.onUnlink.trigger(this, linkable);
		}
		this.#links = new Set;

		//parent
		if (this.parent) this.unlinkParent();

		//children
		for (const child of this.children) {
			if (this.options.removeChildren) child.remove();
			else child.unlinkParent();
		}
		this.children = [];

		//dom
		delete (this.el as any)[attachedComp];

		//globally
		if (!this.options.anonymous) {
			removeFromIdMap(this.id);
			onRemove.trigger(this);
		}

		//root
		if (registry.root === this) removeRoot();
		
		this.status = 'removed';
	}
	
	infoDump (type: 'links'): Linkable[];
	infoDump (type: 'properties'): TMap['props'];
	infoDump (type: 'links' | 'properties') {
		if (type === 'links') return Array.from(this.#links);
		if (type === 'properties') return this.store.infoDump('properties');
		throw_undefined_info_dump_type(type);
	}
}

//why not Component<BaseMap>, i dont know, but it works
export type PureComp = Component<BaseMap & { props: any }>