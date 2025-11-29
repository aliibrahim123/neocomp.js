// linkable unit for easy dependecies managment

import { Event } from "../../common/event.ts";
import type { Store } from "../state/store.ts";

/** interface for automated dependency managment */
export interface Linkable {
	/** event triggered when linkable is linked */
	onLink: Event<(self: Linkable, other: Linkable) => void>;
	/** event triggered when linkable is unlinked */
	onUnlink: Event<(self: Linkable, other: Linkable) => void>;
	/** link a linkable */
	link (other: Linkable): void;
	/** unlink a linkable */
	unlink (other: Linkable): void;
	/** check if a linkable is linked */
	hasLink (other: Linkable): boolean;
}

/** linkable units having an internal store */
export interface DataSource extends Linkable {
	/** the internal store */
	store: Store
}

/** link 2 linkables */
export function link (a: Linkable, b: Linkable) {
	a.link(b);
	b.link(a);
}
/** unlink 2 linkables */
export function unlink (a: Linkable, b: Linkable) {
	a.unlink(b);
	b.unlink(a);
}
/** link safely 2 linkables */
export function tryLink (a: Linkable, b: Linkable) {
	if (a.hasLink(b)) return;
	a.link(b);
	b.link(a);
}
/** unlink safely 2 linkables */
export function tryUnlink (a: Linkable, b: Linkable) {
	if (!a.hasLink(b)) return;
	a.unlink(b);
	b.unlink(a);
}