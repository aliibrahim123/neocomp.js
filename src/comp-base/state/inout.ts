//component bindings

import type { getProps } from "../core/typemap.ts";
import { Component } from "../core/comp.ts";
import { link } from "../core/linkable.ts";
import type { AnyComp } from "../core/comp.ts";

export function $in<From extends AnyComp, To extends AnyComp> (
	from: From, fromProp: (keyof getProps<From> & string) | symbol,
	to: To, toProp: (keyof getProps<To> & string) | symbol
) {
	//link if required
	if (!from.hasLink(to)) link(from, to);
	from.effect([fromProp], () => to.set(toProp, from.get(fromProp)));
}
export function $inout<A extends AnyComp, B extends AnyComp, T> (
	a: A, aProp: (keyof getProps<A> & string) | symbol,
	b: B, bProp: (keyof getProps<B> & string) | symbol,
	comparator = (a: T, b: T) => a === b
) {
	//link if required
	if (!a.hasLink(b)) link(a, b);

	a.store.addEffect([aProp], () => {
		const value = a.get(aProp);
		if (!comparator(value, b.get(bProp))) b.set(bProp, value);
	}, [], b);
	b.store.addEffect([bProp], () => {
		const value = b.get(bProp);
		if (!comparator(a.get(aProp), value)) a.set(aProp, value);
	}, [], a);
}