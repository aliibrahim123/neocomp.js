//linkable unit for easy dependecies managment

import type { Event } from "../../common/event.ts";

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