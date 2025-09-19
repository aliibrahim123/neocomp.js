// reactive store for reactive states

// symbol as key for optimazation

// bulk update: collect updates to avoid overupdate
// same prop multiple updates last won

import { Event } from "../../common/event.ts";
import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { Linkable } from "../core/linkable.ts";
import { throw_adding_existing_prop, throw_end_track_while_not_tracking, throw_track_while_tracking, throw_undefined_prop } from "./errors.ts";
import { ReadOnlySignal, Signal, WriteOnlySignal } from "./signal.ts";
import { UpdateDispatcher, type EffectUnit, type UDispatcherOptions } from "./updateDispatcher.ts";

export interface StoreOptions {
	static: boolean;
	addUndefined: boolean;
	baseProp: Prop<any>;
	updateOnDefine: boolean;
	updateOnSet: boolean;
	updateDispatcher: Partial<UDispatcherOptions>
}

export interface Prop <T> {
	value: T;
	name: string;
	symbol: symbol;
	static: boolean;
	meta?: Record<keyof any, any>;
	setter?: (this: this, value: T, store: Store<any>) => void;
	getter?: (this: this, store: Store<any>) => T;
	comparator: (old: T, New: T, store: Store<any>) => boolean;
}


type DistributeUnion <T> = T extends T ? Signal<T> : never;
export type EffectedProp <Props extends Record<string, any>> = 
	(keyof Props & string) | symbol | DistributeUnion<Props[keyof Props]>;

export class Store <Props extends Record<string, any> = Record<string, any>> {
	#propsBySymbol = new Map<symbol, Prop<any>>();
	#propsByName = new Map<string, Prop<any>>();
	#propsToBeAdded = new Map<string, symbol>();
	#propsToBeAddedNames = new Map<symbol, string>();
	
	dispatcher: UpdateDispatcher;
	base: Linkable;
	constructor (base: Linkable, options: Partial<StoreOptions> = {}) {
		this.options = { ...(this.constructor as typeof Store).defaults, ...options};
		this.base = base;
		this.dispatcher = new UpdateDispatcher(this, this.options.updateDispatcher);
	}
	options: StoreOptions;
	static defaults: StoreOptions = {
		static: false,
		addUndefined: false,
		updateOnDefine: true,
		updateOnSet: true,
		updateDispatcher: {},
		baseProp: {
			name: '',
			symbol: Symbol('neocomp:prop(UNDEFINED)'),
			value: undefined,
			static: false,
			comparator: (old, New) => old === New
		},
	}

	onAdd = new Event<(store: this, prop: Prop<any>) => void>();
	onRemove = new Event<(store: this, prop: Prop<any>) => void>();
	onChange = new Event<(store: this, props: Prop<any>[]) => void>();

	add <P extends keyof Props & string> (
		name: P, propObj: Partial<Omit<Prop<Props[P]>, 'name' | 'symbol'>> = {}
	): Prop<Props[P]> {
		if (this.#propsByName.has(name)) throw_adding_existing_prop(name);
		// if requested before adding
		if (this.#propsToBeAdded.has(name)) {
			var symbol = this.#propsToBeAdded.get(name) as symbol;
			this.#propsToBeAdded.delete(name);
			this.#propsToBeAddedNames.delete(symbol);
		}
		else var symbol = Symbol(`neocomp:prop(${name})`);

		// define prop
		const prop: Prop<Props[P]> = {
			...this.options.baseProp,
			name, symbol, static: this.options.static,
			...propObj,
		}
		// without all the properties share the same default meta
		if (prop.meta) prop.meta = { ...prop.meta };
		
		// add
		this.#propsByName.set(name, prop);
		this.#propsBySymbol.set(symbol, prop);
		// trigger events
		this.onAdd.trigger(this, prop);
		if (this.options.updateOnDefine) this.#update(prop, true);

		return prop
	}

	get <P extends keyof Props & string> (name: P | symbol): Props[P] {
		const prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);
		
		// track
		if (this.#isTracking && !(prop && prop.static)) this.#trackProps?.effectedBy.add(
			prop?.symbol || (typeof(name) === 'symbol' ? name : this.getSymbolFor(name))
		);

		if (!prop) return undefined as any;
		return prop.getter ? prop.getter.call(prop, this) : prop.value
	}
	getProp <P extends keyof Props & string> (name: P | symbol): Prop<Props[P]> {
		const prop = (typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name)) as Prop<Props[P]>;
		
		// track
		if (this.#isTracking && !prop.static) this.#trackProps.effectedBy.add(prop.symbol);

		return prop
	}
	getSymbolFor (name: keyof Props & string): symbol {
		// case added before
		const prop = this.#propsByName.get(name);
		if (prop) return prop.symbol;
		// else request to added
		if (this.#propsToBeAdded.has(name)) return this.#propsToBeAdded.get(name) as symbol;
		const symbol = Symbol(`neocomp:prop(${name})`);
		this.#propsToBeAdded.set(name, symbol);
		this.#propsToBeAddedNames.set(symbol, name);
		return symbol
	}

	set <P extends keyof Props & string> (name: P | symbol, value: Props[P]) {
		let prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);
		
		// add if not defined
		if (!prop) {
			if (!this.options.addUndefined) throw_undefined_prop('setting', name, '', 203);
			if (typeof(name) === 'symbol') {
				const requestedName = this.#propsToBeAddedNames.get(name) as P;
				if (!requestedName) return throw_undefined_prop('setting', name, ' by symbol', 204);
				name = requestedName;
			}
			prop = this.add(name as P, { value });

			// update if not updated by add method
			if (this.options.updateOnSet && !this.options.updateOnDefine) 
				this.#update(prop);

			// track
			if (this.#isTracking && !prop.static) this.#trackProps.effected.add(prop.symbol);

			return;
		}

		const old = prop.value;
		if (prop.setter) prop.setter.call(prop, value, this);
		else prop.value = value;

		// update
		if (this.options.updateOnSet && !prop.static && !prop.comparator(old, prop.value, this))
			this.#update(prop);
		
		// track
		if (this.#isTracking && !prop.static) this.#trackProps.effected.add(prop.symbol);
	}
	setMultiple (props: Partial<Props>) {
		this.startBulkUpdate();
		for (const prop in props) this.set(prop, props[prop] as any);
		this.endBulkUpdate();
	}

	has (name: keyof Props & string | symbol) {
		return typeof(name) === 'string' ?
			this.#propsByName.has(name) :
			this.#propsBySymbol.has(name)
	}

	remove (name: keyof Props & string | symbol) {
		const prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);
		
		if (!prop) return throw_undefined_prop('removing', name, '', 205);

		this.#propsByName.delete(prop.name);
		this.#propsBySymbol.delete(prop.symbol);
		this.onRemove.trigger(this, prop);
	}

	createComputed <P extends keyof Props & string> (
		name: P | symbol, effectedBy: EffectedProp<Props>[] | 'track', fn: () => Props[P]
	): ReadOnlySignal<Props[P]> {
		if (effectedBy === 'track') this.addEffect('track', () => this.set(name, fn()));
		else this.addEffect(effectedBy, () => this.set(name, fn()), [name]);
		return new ReadOnlySignal(this, typeof(name) === 'symbol' ? name : this.getSymbolFor(name));
	}
	
	#initForUse <P extends keyof Props & string> (name: P | symbol, Default?: Props[P]): symbol {
		if (this.has(name)) return this.getProp(name).symbol;
		if (Default !== undefined) {
			if (typeof(name) === 'string') return this.add(name, { value: Default }).symbol;
			this.set(name, Default);
			return this.getProp(name).symbol;
		}
		// possibly request to be added
		if (typeof(name) === 'string') return this.getSymbolFor(name);
		if (!this.#propsBySymbol.has(name)) throw_undefined_prop('using', name, ' by symbol', 207);
		return name
	}
	createSignal <P extends keyof Props & string> (name: P | symbol, Default?: Props[P])
	  : Signal<Props[P]> {
		return new Signal(this, this.#initForUse(name, Default))
	}
	createROSignal <P extends keyof Props & string> (name: P | symbol, Default?: Props[P]) 
	: ReadOnlySignal<Props[P]> {
		return new ReadOnlySignal(this, this.#initForUse(name, Default));
	}
	createWOSignal <P extends keyof Props & string> (name: P | symbol, Default?: Props[P]) 
	: WriteOnlySignal<Props[P]> {
		return new WriteOnlySignal(this, this.#initForUse(name, Default));
	}

	addEffect (
		effectedBy: EffectedProp<Props>[], handler: (this: EffectUnit) => void,
		effect: EffectedProp<Props>[], from?: Linkable, meta?: object
	): void;
	addEffect(
		track: 'track', handler: (this: EffectUnit) => void, unused?: undefined, 
		from?: Linkable, meta?: object
	): void;
	addEffect(
		effectedBy: EffectedProp<Props>[] | 'track', handler: (this: EffectUnit) => void,
		effect: EffectedProp<Props>[] = [], from?: Linkable, meta: object = {}
	) {
		if (effectedBy === 'track') this.startTrack();
		
		// call on define
		handler.call(undefined as any);
		
		// get tracked properties
		if (effectedBy === 'track')
			({ effected: effect, effecting: effectedBy } = this.endTrack());
		
		// add effect unit
		const toSymbol = (prop: EffectedProp<Props>) => 
			typeof(prop) === 'symbol' ? prop 
		: prop instanceof Signal ? prop.prop
		: this.getSymbolFor(prop);
		
		this.dispatcher.add(effectedBy.map(toSymbol), effect.map(toSymbol), handler, from, meta);
	}

	#bulkUpdates = 0;
	get bulkUpdating () { return this.#bulkUpdates > 0 };
	#updatedProps = new Set<Prop<any>>;
	startBulkUpdate () {
		this.#bulkUpdates++;
	}
	endBulkUpdate () {
		this.#bulkUpdates--;
		if (this.#bulkUpdates > 0) return;
		
		if (this.#updatedProps.size === 0) return;
		const props = Array.from(this.#updatedProps);
		this.#updatedProps = new Set;
		this.onChange.trigger(this, props);
	}
	#update (prop: Prop<any>, evenStatic = false) {
		if (!evenStatic && prop.static) return;
		if (this.bulkUpdating) {
			this.#updatedProps.add(prop);
			return;
		}
		this.onChange.trigger(this, [prop])
	}
	forceUpdate (name: keyof Props & string | symbol) {
		const prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);

		if (!prop) return throw_undefined_prop('force updating', name, '', 206);
		this.#update(prop, true);
	}
	updateAll (withStatic = true) {
		this.startBulkUpdate();
		for (const [_, prop] of this.#propsByName) if (withStatic || !prop.static) 
			this.#updatedProps.add(prop);
		this.endBulkUpdate();
	}

	#isTracking = false;
	get isTracking () { return this.#isTracking };
	#trackProps = { effectedBy: new Set<symbol>, effected: new Set<symbol> };
	startTrack () {
		if (this.#isTracking) throw_track_while_tracking();
		this.#isTracking = true;
		this.startBulkUpdate();
	}
	endTrack () {
		if (!this.#isTracking) throw_end_track_while_not_tracking();
		this.#isTracking = false;
		this.endBulkUpdate();
		const trackedProps = this.#trackProps ;
		this.#trackProps = { effectedBy: new Set, effected: new Set };
		return { 
			effecting: Array.from(trackedProps.effectedBy), 
			effected: Array.from(trackedProps.effected) 
		}
	}
	
	*[Symbol.iterator] () {
		for (const [_, prop] of this.#propsByName) yield prop;
	}

	infoDump (type: 'properties'): Props;
	infoDump (type: 'propertiesToBeAdded'): string[];
	infoDump (type: 'properties' | 'propertiesToBeAdded') {
		if (type === 'properties') return Object.fromEntries(this.#propsByName);
		if (type === 'propertiesToBeAdded') return Array.from(this.#propsToBeAdded.keys());
		throw_undefined_info_dump_type(type);
	}
}