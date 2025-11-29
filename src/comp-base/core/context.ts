import { Event } from "../../common/event.ts";
import type { ReadOnlySignal, Signal } from "../state/signal.ts";
import type { EffectedProp, EffectingProp, PropId, StoreOptions } from "../state/store.ts";
import { Store } from "../state/store.ts";
import { throw_linking_linked, throw_undefined_info_dump_type, throw_unlinking_not_linked } from "./errors.ts";
import { unlink, type DataSource, type Linkable } from "./linkable.ts";

/** independent state provider */
export class Context implements DataSource {
	store: Store;
	constructor (storeOptions: Partial<StoreOptions> = {}) {
		this.store = new Store(this, storeOptions);
	}

	/** get property of id */
	get<T = any> (id: PropId<T> | number) {
		return this.store.get(id);
	}
	/** set property by id */
	set<T = any> (id: PropId<T> | number, value: T) {
		this.store.set(id, value);
	}
	/** check if property exists */
	has (id: number) {
		return this.store.has(id)
	}
	/** create a new signal */
	signal<T = any> (value?: T) {
		return this.store.signal(value);
	}
	/** created a computed property */
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[] | (() => T), fn?: () => T) {
		return this.store.computed(effectedBy as any, fn!);
	}
	/** attach a effect */
	effect (handler: () => void): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[], handler: () => void
	): void;
	effect (
		a: EffectingProp[] | (() => void),
		b: EffectedProp[] | undefined = undefined, c?: () => void,
	) {
		this.store.effect(a as any, b as any, c);
	}

	onLink = new Event<(context: this, linked: Linkable) => void>();
	onUnlink = new Event<(context: this, unlinked: Linkable) => void>();
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
	/** unlink all linked linkables */
	unlinkAll () {
		for (const link of this.#links) unlink(this, link);
	}

	/** dump information */
	infoDump (type: 'links'): Linkable[];
	infoDump (type: 'properties'): Record<number, any>;
	infoDump (type: 'links' | 'properties' | 'values') {
		if (type === 'links') return Array.from(this.#links);
		if (type === 'properties') return this.store.infoDump('values');
		throw_undefined_info_dump_type(type);
	}
}