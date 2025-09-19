// portable lightweight signals

import { Store, type Prop } from "./store.ts";

export class Signal <T> {
	#store: Store<any>;
	#prop: symbol
	constructor (store: Store<any>, prop: symbol) {
		this.#store = store;
		this.#prop = prop;
	}
	get value (): T {
		return this.#store.get(this.#prop)
	}
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	get prop () { return this.#prop }
	get name () { return this.#store.getProp(this.#prop).name }
	get Prop (): Prop<T> {  return this.#store.getProp(this.#prop) }
	get store () { return this.#store }
	update () {
		this.store.forceUpdate(this.prop);
	}
	get asReadOnly () { return new ReadOnlySignal<T>(this.#store, this.#prop) }
	get asWriteOnly () { return new WriteOnlySignal<T>(this.#store, this.#prop) }
}

export class ReadOnlySignal <T> {
	#store: Store<any>;
	#prop: symbol
	constructor (store: Store<any>, prop: symbol) {
		this.#store = store;
		this.#prop = prop;
	}
	get value (): T {
		return this.#store.get(this.#prop)
	}
	get prop () { return this.#prop }
	get store () { return this.#store }
}
export class WriteOnlySignal <T> {
	#store: Store<any>;
	#prop: symbol
	constructor (store: Store<any>, prop: symbol) {
		this.#store = store;
		this.#prop = prop;
	}
	set value (value: T) {
		this.#store.set(this.#prop, value)
	}
	update () {
		this.store.forceUpdate(this.prop);
	}
	get prop () { return this.#prop }
	get store () { return this.#store }
}