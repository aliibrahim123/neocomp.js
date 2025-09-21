// portable lightweight signals

import { Store, type Prop, type PropId } from "./store.ts";

export class Signal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	get value (): T {
		return this.#store.get(this.#prop)
	}
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	get id () { return this.#prop as PropId<T> }
	get prop () { return this.#store.getProp(this.#prop) }
	get store () { return this.#store }
	update () {
		this.store.forceUpdate(this.#prop);
	}
	get asReadOnly () { return new ReadOnlySignal<T>(this.#store, this.#prop) }
	get asWriteOnly () { return new WriteOnlySignal<T>(this.#store, this.#prop) }
}

export class ReadOnlySignal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	get value (): T {
		return this.#store.get(this.#prop)
	}
	get id () { return this.#prop as PropId<T> }
	get prop () { return this.#store.getProp(this.#prop) }
	get store () { return this.#store }
}
export class WriteOnlySignal<T> {
	#store: Store;
	#prop: number;
	constructor (store: Store, prop: PropId<T> | number) {
		this.#store = store;
		this.#prop = prop;
	}
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	update () {
		this.store.forceUpdate(this.#prop);
	}
	get id () { return this.#prop as PropId<T> }
	get prop () { return this.#store.getProp(this.#prop) }
	get store () { return this.#store }
}