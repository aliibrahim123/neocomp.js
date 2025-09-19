// linkable unit for easy dependecies managment

import { Event } from "../../common/event.ts";
import { throw_linking_linked, throw_unlinking_not_linked } from "./errors.ts";

export interface Linkable {
	onLink: Event<(self: Linkable, other: Linkable) => void>;
	onUnlink: Event<(self: Linkable, other: Linkable) => void>;
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