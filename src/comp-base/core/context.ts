import { Event } from "../../common/event.ts";
import type { StoreOptions } from "../state/store.ts";
import { Store } from "../state/store.ts";
import { throw_linking_same, throw_unlinking_not_linked } from "./errors.ts";
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
	has (name: (keyof Props & string) | symbol) {
		return this.store.has(name)
	}
	signal <P extends keyof Props & string> (name: P | symbol, value?: Props[P]) {
		return this.store.createSignal(name, value);
	}
	effect (
		effectedBy: ((keyof Props & string) | symbol)[], handler: () => void,
		effect: ((keyof Props & string) | symbol)[] = [], from?: Linkable
	) { this.store.addEffect(effectedBy, handler, effect, from) }

	onLink = new Event<(context: this, linked: Linkable) => void>();
	onUnlink = new Event<(context: this, unlinked: Linkable) => void>();
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
	hasLink (other: Linkable): boolean {
		return this.#links.has(other);
	}
	unlinkAll () {
		for (const link of this.#links) unlink(this, link);
	}
}