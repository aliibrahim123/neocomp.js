// component bindings

import { link } from "../core/linkable.ts";
import { Signal } from "./signal.ts";

export function $in<T> (from: Signal<T>, to: Signal<T>) {
	const From = from.store.base, To = to.store.base;

	// link if required
	if (!From.hasLink(To)) link(From, To);

	From.store.effect([from], [], () => to.value = from.value, [To]);
}

export function inout<T> (a: Signal<T>, b: Signal<T>, comparator = (a: T, b: T) => a === b) {
	const A = a.store.base, B = b.store.base;

	// link if required
	if (!A.hasLink(B)) link(A, B);

	A.store.effect([a], [], () => {
		const value = a.value;
		if (!comparator(value, b.value)) b.value = value;
	}, [B]);
	B.store.effect([b], [], () => {
		const value = b.value;
		if (!comparator(a.value, value)) a.value = value;
	}, [A]);
}