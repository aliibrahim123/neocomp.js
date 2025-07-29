//component bindings

import type { BaseMap, getProps } from "../core/typemap.ts";
import { link } from "../core/linkable.ts";
import { Component, type PureComp } from "../core/comp.ts";
import type { EffectedProp } from "./store.ts";
import { Signal } from "./signal.ts";

function set (comp: PureComp, prop: EffectedProp<any>, value: any) {
	if (prop instanceof Signal) prop.value = value;
	else comp.set(prop, value);
}
function get (comp: PureComp, prop: EffectedProp<any>) {
	return prop instanceof Signal ? prop.value: comp.get(prop);
}

export function $in<From extends PureComp, To extends PureComp> (
	from: From, fromProp: EffectedProp<getProps<From>>,	to: To, toProp: EffectedProp<getProps<To>>
) {
	//link if required
	if (!from.hasLink(to)) link(from, to);
	from.effect([fromProp], () => set(to, toProp, get(from, fromProp)));
}

export function inout<A extends PureComp, B extends PureComp, T> (
	a: A, aProp: EffectedProp<getProps<A>>, b: B, bProp: EffectedProp<getProps<B>>,
	comparator = (a: T, b: T) => a === b
) {
	//link if required
	if (!a.hasLink(b)) link(a, b);

	a.store.addEffect([aProp], () => {
		const value = get(a, aProp);
		if (!comparator(value, get(b, bProp))) set(b, bProp, value);
	}, [], b);
	b.store.addEffect([bProp], () => {
		const value = get(b, bProp);
		if (!comparator(get(a, aProp), value)) set(a, aProp, value);
	}, [], a);
}