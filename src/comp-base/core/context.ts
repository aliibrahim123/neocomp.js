import { Event } from "../../common/event.ts";
import type { EffectedProp, StoreOptions } from "../state/store.ts";
import { Store } from "../state/store.ts";
import { throw_linking_linked, throw_undefined_info_dump_type, throw_unlinking_not_linked } from "./errors.ts";
import { unlink, type Linkable } from "./linkable.ts";

export class Context <Props extends Record<string, any>> implements Linkable {
	store: Store<Props>;
	constructor (props: Partial<Props> = {}, storeOptions: Partial<StoreOptions> = {}) {
		this.store = new Store(this, storeOptions);
		this.store.setMultiple(props);
	}

	get <P extends keyof Props & string> (name: P | symbol) {
		return this.store.get(name)
	}
	set <P extends keyof Props & string> (name: P | symbol, value: Props[P]) {
		this.store.set(name, value)
	}
	setMuliple (props: Partial<Props>) {
		this.store.setMultiple(props)
	}
	has (name: (keyof Props & string) | symbol) {
		return this.store.has(name)
	}
	signal <P extends keyof Props & string> (name: P | symbol, value?: Props[P]) {
		return this.store.createSignal(name, value);
	}
	computed <P extends keyof Props & string> (
		name: P | symbol, effectedBy: EffectedProp<Props>[] | 'track', fn: () => Props[P]
	) {
		return this.store.computed(name, effectedBy, fn);
	}
	effect (
		effectedBy: EffectedProp<Props>[], handler: () => void,
		effect?: EffectedProp<Props>[]
	): void;
	effect (track: 'track', handler: () => void): void;
	effect (
		effectedBy: EffectedProp<Props>[] | 'track', handler: () => void,
		effect: EffectedProp<Props>[] = []
	) { 
		if (effectedBy === 'track') this.store.addEffect('track', handler);
		else this.store.addEffect(effectedBy, handler, effect);
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
	unlinkAll () {
		for (const link of this.#links) unlink(this, link);
	}

	infoDump (type: 'links'): Linkable[];
	infoDump (type: 'properties'): Props;
	infoDump (type: 'links' | 'properties') {
		if (type === 'links') return Array.from(this.#links);
		if (type === 'properties') return this.store.infoDump('properties');
		throw_undefined_info_dump_type(type);
	}
}