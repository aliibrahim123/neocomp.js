//linkable unit for easy dependecies managment

import { Event } from "../../common/event.ts";
import { throw_linking_same, throw_unlinking_not_linked } from "./errors.ts";

export interface Linkable {
	onLink: Event<(self: any, other: Linkable) => void>;
	onUnlink: Event<(self: any, other: Linkable) => void>;
	link (other: Linkable): void;
	unlink (other: Linkable): void;
	hasLink (other: Linkable): boolean;
}

export function link (a: Linkable, b: Linkable) {
	a.link(b);
	b.link(a);
}
export function unlink (a: Linkable, b: Linkable) {
	a.unlink(b);
	b.unlink(a);
}

export class Resource<T> implements Linkable {
	value: T;
	constructor (value: T) {
		this.value = value;
	}

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
export function $resource <T> (value: T): Resource<T> {
	return new Resource(value)
}