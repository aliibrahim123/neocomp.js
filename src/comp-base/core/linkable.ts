// linkable unit for easy dependecies managment

import { Event } from "../../common/event.ts";
import type { Store } from "../state/store.ts";

export interface Linkable {
	onLink: Event<(self: Linkable, other: Linkable) => void>;
	onUnlink: Event<(self: Linkable, other: Linkable) => void>;
	link (other: Linkable): void;
	unlink (other: Linkable): void;
	hasLink (other: Linkable): boolean;
}

export interface DataSource extends Linkable {
	store: Store
}

export function link (a: Linkable, b: Linkable) {
	a.link(b);
	b.link(a);
}
export function unlink (a: Linkable, b: Linkable) {
	a.unlink(b);
	b.unlink(a);
}
export function tryLink (a: Linkable, b: Linkable) {
	if (a.hasLink(b)) return;
	a.link(b);
	b.link(a);
}
export function tryUnlink (a: Linkable, b: Linkable) {
	if (!a.hasLink(b)) return;
	a.unlink(b);
	b.unlink(a);
}