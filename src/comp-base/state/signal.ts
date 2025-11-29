// portable lightweight signals

import { Store, type Prop, type PropId } from "./store.ts";

/** reactive wrapper around a property */
export class Signal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	/** the wrapped property value */
	get value (): T {
		return this.#store.get(this.#prop)
	}
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	/** peek into the wrapped property */
	peek (): T {
		return this.#store.get(this.#prop, true);
	}
	/** the wrapped property id */
	get id () { return this.#prop as PropId<T> }
	/** the wrapped property definition */
	get prop () { return this.#store.getProp(this.#prop) }
	/** the wrapped property store */
	get store () { return this.#store }
	/** force update the property */
	update () {
		this.store.forceUpdate(this.#prop);
	}
	/** cast to a read only signal */
	get asReadOnly () { return new ReadOnlySignal<T>(this.#store, this.#prop) }
	/** cast to a write only signal */
	get asWriteOnly () { return new WriteOnlySignal<T>(this.#store, this.#prop) }
}

/** read only wrapper around a property */
export class ReadOnlySignal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	/** the wrapped property value */
	get value (): T {
		return this.#store.get(this.#prop)
	}
	/** peek into the wrapped property */
	peek (): T {
		return this.#store.get(this.#prop, true);
	}
	/** the wrapped property id */
	get id () { return this.#prop as PropId<T> }
	/** the wrapped property definition */
	get prop () { return this.#store.getProp(this.#prop) }
	/** the wrapped property store */
	get store () { return this.#store }
}
/** write only wrapper around a property */
export class WriteOnlySignal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	/** the wrapped property value */
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	/** force update the property */
	update () {
		this.store.forceUpdate(this.#prop);
	}
	/** the wrapped property id */
	get id () { return this.#prop as PropId<T> }
	/** the wrapped property definition */
	get prop () { return this.#store.getProp(this.#prop) }
	/** the wrapped property store */
	get store () { return this.#store }
}