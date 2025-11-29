// reactive store for reactive states

// bulk update: collect updates to avoid overupdate
// same prop multiple updates last won

import { Event } from "../../common/event.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { DataSource, Linkable } from "../core/linkable.ts";
import { throw_end_track_while_not_tracking, throw_track_while_tracking, throw_undefined_prop } from "./errors.ts";
import { ReadOnlySignal, Signal, WriteOnlySignal } from "./signal.ts";
import { UpdateDispatcher, type EffectUnit } from "./updateDispatcher.ts";

/** options for `Store` */
export interface StoreOptions {
	/** whether the store is static */
	static: boolean;
	/** the base definition of all properties */
	baseProp: Prop;
}

/** property definition */
export interface Prop {
	/** the property value */
	value: any;
	/** the property id */
	id: number,
	/** whether the property is static */
	static: boolean;
	/** user defined metadata */
	meta: Record<keyof any, any>;
	/** comparator function */
	comparator: (this: Prop, old: any, New: any, store: Store) => boolean;
}

/** property identifier */
export type PropId<T> = number & { type: T };

export type EffectedProp = number | Signal<any> | WriteOnlySignal<any>;
export type EffectingProp = number | Signal<any> | ReadOnlySignal<any>;

/** a unit storing reactive properties */
export class Store {
	#props = new Map<number, Prop>();
	#curId = 0;

	dispatcher: UpdateDispatcher;
	/** the host data source */
	base: DataSource;
	constructor (base: DataSource, options: Partial<StoreOptions> = {}) {
		this.options = { ...(this.constructor as typeof Store).defaults, ...options };
		this.base = base;
		this.dispatcher = new UpdateDispatcher(this);
	}
	/** the store options */
	options: StoreOptions;
	/** default options for all stores */
	static defaults: StoreOptions = {
		static: false,
		baseProp: {
			id: 0,
			value: undefined,
			static: false,
			meta: {},
			comparator: (old, New) => old === New
		},
	}

	/** event triggered when a property is added */
	onAdd = new Event<(store: this, prop: Prop) => void>();
	/** event triggered when a property is removed */
	onRemove = new Event<(store: this, prop: Prop) => void>();
	/** event triggered when properties are changed */
	onChange = new Event<(store: this, props: Prop[]) => void>();

	/** create a new property from definition */
	create (def: Partial<Omit<Prop, 'id'>> = {}): Prop {
		// define prop
		const prop: Prop = {
			...this.options.baseProp, id: this.#curId++, static: this.options.static, ...def,
		}
		// without all the properties share the same default meta
		if (prop.meta) prop.meta = { ...prop.meta };

		// add
		this.#props.set(prop.id, prop);
		// trigger events
		this.onAdd.trigger(this, prop);
		if (!prop.static) this.#update(prop, true);

		return prop
	}

	/** get property by id */
	get<T = any> (id: PropId<T> | number, peak = false): T {
		const prop = this.#props.get(id);

		if (!prop) throw_undefined_prop('getting', id, '', 204);

		// track
		if (this.#isTracking && !peak && !prop?.static) this.#trackProps?.effecting.add(id);

		return prop?.value
	}
	/** get property definition */
	getProp (id: number): Prop {
		const prop = this.#props.get(id)!;

		// track
		if (this.#isTracking && !prop.static) this.#trackProps.effecting.add(id);

		return prop
	}

	/** set a property by id */
	set<T = any> (id: PropId<T> | number, value: T) {
		let prop = this.#props.get(id);

		if (!prop) return throw_undefined_prop('setting', id, '', 203);
		const old = prop.value;
		prop.value = value;

		// update
		if (!prop.static && !prop.comparator(old, prop.value, this))
			this.#update(prop);

		// track
		if (this.#isTracking && !prop.static) this.#trackProps.effected.add(prop.id);
	}

	/** whether a property exists */
	has (id: number) {
		return this.#props.has(id);
	}

	/** remove a property */
	remove (id: number) {
		const prop = this.#props.get(id);

		if (!prop) return throw_undefined_prop('removing', id, '', 205);

		this.#props.delete(id);
		this.onRemove.trigger(this, prop);
	}

	/** create a computed property */
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[] | (() => T), fn?: () => T) {
		let id = this.create().id;
		if (typeof (effectedBy) === 'function') this.effect(() => this.set(id, effectedBy()));
		else this.effect(effectedBy, [id], () => this.set(id, fn?.()));
		return new ReadOnlySignal(this, id);
	}

	/** create a new signal */
	signal<T = any> (value?: T) {
		let id = this.create({ value }).id;
		return new Signal<T>(this, id)
	}
	/** create a read only signal */
	ROSignal<T = any> (value?: T) {
		let id = this.create({ value }).id;
		return new ReadOnlySignal<T>(this, id)
	}
	/** create a write only signal */
	WOSignal<T = any> (value?: T) {
		let id = this.create({ value }).id;
		return new WriteOnlySignal<T>(this, id)
	}

	/** attach an effect */
	effect (
		handler: (this: EffectUnit) => void, bindings?: any[], meta?: object
	): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[],
		handler: (this: EffectUnit) => void, bindings?: any[], meta?: object
	): void;
	effect (
		a: EffectingProp[] | ((this: EffectUnit) => void),
		b: EffectedProp[] | any[] | undefined = undefined,
		c: (this: EffectUnit) => void, bindings = [], meta = {}
	) {
		if (typeof (a) === 'function') {
			this.startTrack();
			a.call(undefined as any);
			var { effected, effecting } = this.endTrack();
			this.dispatcher.add(effecting, effected, a, b, c);
		} else {
			function toId (x: number | Signal<any> | ReadOnlySignal<any>) {
				return typeof (x) === 'number' ? x : x.id;
			}
			c.call(undefined as any);
			this.dispatcher.add(a.map(toId), (b as any).map(toId), c, bindings, meta);
		}

	}

	#bulkUpdates = 0;
	/** is in bulk updating */
	get bulkUpdating () { return this.#bulkUpdates > 0 };
	#updatedProps = new Set<Prop>;
	/** start a bulk update */
	startBulkUpdate () {
		this.#bulkUpdates++;
	}
	/** end a bulk update */
	endBulkUpdate () {
		this.#bulkUpdates--;
		if (this.#bulkUpdates > 0) return;

		if (this.#updatedProps.size === 0) return;
		const props = Array.from(this.#updatedProps);
		this.#updatedProps = new Set;
		this.onChange.trigger(this, props);
	}
	/** trigger an update */
	#update (prop: Prop, evenStatic = false) {
		if (!evenStatic && prop.static) return;
		if (this.bulkUpdating) {
			this.#updatedProps.add(prop);
			return;
		}
		this.onChange.trigger(this, [prop])
	}
	/** force update a property */
	forceUpdate (id: number) {
		const prop = this.#props.get(id);

		if (!prop) return throw_undefined_prop('force updating', id, '', 206);
		this.#update(prop, true);
	}
	/** update all properties */
	updateAll (withStatic = true) {
		this.startBulkUpdate();
		for (const [_, prop] of this.#props) if (withStatic || !prop.static)
			this.#updatedProps.add(prop);
		this.endBulkUpdate();
	}

	#isTracking = false;
	/** is tracking properties */
	get isTracking () { return this.#isTracking };
	#trackProps = { effecting: new Set<number>, effected: new Set<number> };
	/** give a hint about a property role */
	trackHint (id: number, role: 'effected' | 'effecting') {
		if (!this.#isTracking) return;
		this.#trackProps[role].add(id);
	}
	/** start tracking properties */
	startTrack () {
		if (this.#isTracking) throw_track_while_tracking();
		this.#isTracking = true;
		this.startBulkUpdate();
	}
	/** end tracking properties */
	endTrack () {
		if (!this.#isTracking) throw_end_track_while_not_tracking();
		this.#isTracking = false;
		this.endBulkUpdate();
		const trackedProps = this.#trackProps;
		this.#trackProps = { effecting: new Set, effected: new Set };
		return {
			effecting: Array.from(trackedProps.effecting),
			effected: Array.from(trackedProps.effected)
		}
	}

	*[Symbol.iterator] () {
		for (const [_, prop] of this.#props) yield prop;
	}

	/** dump info */
	infoDump (type: 'properties'): Record<number, Prop>;
	infoDump (type: 'values'): Record<number, any>;
	infoDump (type: 'properties' | 'values') {
		if (type === 'properties') return Object.fromEntries(this.#props);
		if (type === 'values') return Object.fromEntries(
			this.#props.entries().map(([id, prop]) => [id, prop.value])
		);
		throw_undefined_info_dump_type(type);
	}
}