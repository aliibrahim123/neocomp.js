//reactive store for reactive states

//symbol as key for optimazation

//bulk update: collect updates to avoid overupdate
//same prop multiple updates last won

import { Event } from "../../common/event.ts";
import type { Linkable } from "../core/linkable.ts";
import { throw_adding_existing_prop, throw_undefined_prop } from "./errors.ts";
import { ReadOnlySignal, Signal, WriteOnlySignal } from "./signal.ts";
import { UpdateDispatcher, type EffectUnit, type UDispatcherOptions } from "./updateDispatcher.ts";

export interface StoreOptions {
	static: boolean;
	addUndefined: boolean;
	basePropObject: Prop<any>;
	updateOnDefine: boolean;
	updateOnSet: boolean;
	updateDispatcher: Partial<UDispatcherOptions>
}

export interface Prop <T> {
	value: T;
	name: string;
	symbol: symbol;
	isStatic: boolean;
	meta: Record<keyof any, any>;
	init?: (this: this) => void;
	setter?: (this: this, value: T) => void;
	getter?: (this: this) => T;
	comparator: (old: T, New: T) => boolean;
}

export class Store <Props extends Record<string, any> = Record<string, any>> {
	#propsBySymbol = new Map<symbol, Prop<any>>();
	#propsByName = new Map<string, Prop<any>>();
	#propsToBeAdded = new Map<string, symbol>();

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
		basePropObject: {
			name: '',
			symbol: Symbol('neocomp:prop(UNDEFINED)'),
			value: undefined,
			isStatic: false,
			meta: {},
			init: undefined,
			setter: undefined,
			getter: undefined,
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
		//if requested before adding
		if (this.#propsToBeAdded.has(name)) {
			var symbol = this.#propsToBeAdded.get(name) as symbol;
			this.#propsToBeAdded.delete(name);
		}
		else var symbol = Symbol(`neocomp:prop(${name})`);

		//define prop
		const prop: Prop<Props[P]> = {
			...this.options.basePropObject,
			name, symbol, isStatic: this.options.static,
			...propObj,
		}
		prop.meta = { ...prop.meta };
		//init
		if (prop.init) prop.init.call(prop);

		//add
		this.#propsByName.set(name, prop);
		this.#propsBySymbol.set(symbol, prop);
		//trigger events
		this.onAdd.trigger(this, prop);
		if (this.options.updateOnDefine) this.#update(prop, true);

		return prop
	}

	get <P extends keyof Props & string> (name: P | symbol): Props[P] {
		const prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);
		
		if (!prop) return undefined as any;
		return prop.getter ? prop.getter.call(prop) : prop.value
	}
	getProp <P extends keyof Props & string> (name: P | symbol): Prop<Props[P]> {
		return typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name) as any;
	}
	getSymbolFor (name: keyof Props & string): symbol {
		//case added before
		const prop = this.#propsByName.get(name);
		if (prop) return prop.symbol;
		//else request to added
		if (this.#propsToBeAdded.has(name)) return this.#propsToBeAdded.get(name) as symbol;
		const symbol = Symbol(`neocomp:prop(${name})`);
		this.#propsToBeAdded.set(name, symbol);
		return symbol
	}

	set <P extends keyof Props & string> (name: P | symbol, value: Props[P]): Prop<Props[P]> {
		let prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);
		
		//add if not defined
		if (!prop) {
			if (!this.options.addUndefined) throw_undefined_prop('setting', name);
			if (typeof(name) === 'symbol') throw_undefined_prop('setting', name, ' by symbol');
			prop = this.add(name as P, { value });
			//update if not updated by add method
			if (this.options.updateOnSet && !this.options.updateOnDefine) 
				this.#update(prop);
			return prop
		}

		const old = prop.value;
		if (prop.setter) prop.setter.call(prop, value);
		else prop.value = value;
		//update
		if (this.options.updateOnSet && !prop.isStatic && !prop.comparator(old, prop.value))
			this.#update(prop);
		return prop;
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
		
		if (!prop) return throw_undefined_prop('removing', name);

		this.#propsByName.delete(prop.name);
		this.#propsBySymbol.delete(prop.symbol);
		this.onRemove.trigger(this, prop);
	}

	#bulkUpdates = 0;
	get bulkUpdating () { return this.#bulkUpdates > 0 };
	#updatedProps = new Set<Prop<any>>;
	startBulkUpdate () {
		this.#bulkUpdates++;
	}
	#update (prop: Prop<any>, evenStatic = false) {
		if (!evenStatic && prop.isStatic) return;
		if (this.bulkUpdating) {
			this.#updatedProps.add(prop);
			return;
		}
		this.onChange.trigger(this, [prop])
	}
	endBulkUpdate () {
		this.#bulkUpdates--;
		if (this.#bulkUpdates > 0) return;

		const props = Array.from(this.#updatedProps);
		this.#updatedProps = new Set;
		this.onChange.trigger(this, props);
	}
	forceUpdate (name: keyof Props & string | symbol) {
		const prop = typeof(name) === 'string' ? 
			this.#propsByName.get(name) : 
			this.#propsBySymbol.get(name);

		if (!prop) return throw_undefined_prop('force updating', name);
		this.#update(prop, true);
	}
	updateAll (withStatic = true) {
		this.startBulkUpdate();
		for (const [_, prop] of this.#propsByName) this.#update(prop, withStatic);
		this.endBulkUpdate();
	}

	initForUse <P extends keyof Props & string> (name: P | symbol, value?: Props[P]): symbol {
		if (value) return this.set(name, value).symbol;
		//possibly request to be added
		if (typeof(name) === 'string') return this.getSymbolFor(name);
		if (!this.#propsBySymbol.has(name)) throw_undefined_prop('using', name, ' by symbol');
		return name
	}
	createSignal <P extends keyof Props & string> (name: P | symbol, value?: Props[P]) {
		return new Signal(this, this.initForUse(name, value))
	}
	createROSignal <P extends keyof Props & string> (name: P | symbol, value?: Props[P]) {
		return new ReadOnlySignal(this, this.initForUse(name, value));
	}
	createWOSignal <P extends keyof Props & string> (name: P | symbol, value?: Props[P]) {
		return new WriteOnlySignal(this, this.initForUse(name, value));
	}

	addEffect (
		effectedBy: ((keyof Props & string) | symbol)[], handler: (this: EffectUnit) => void,
		effect: ((keyof Props & string) | symbol)[] = [], from?: Linkable, meta: object = {}
	) {
		this.dispatcher.add(effectedBy.map(
			prop => typeof(prop) === 'symbol' ? prop : this.getSymbolFor(prop)
		), effect.map(
			prop => typeof(prop) === 'symbol' ? prop : this.getSymbolFor(prop)
		), handler, from, meta);
	}

	get asObject (): Props {
		const obj: Record<string, any> = {};
		for (const [name, prop] of this.#propsByName) obj[name] = prop.value;
		return obj as Props
	}
	get asMap (): Map<string, any> {
		const map = new Map;
		for (const [name, prop] of this.#propsByName) map.set(name, prop.value);
		return map
	}
	*[Symbol.iterator] () {
		for (const [_, prop] of this.#propsBySymbol) yield prop;
	}
	get propsToBeAdded () { return this.#propsToBeAdded }
}