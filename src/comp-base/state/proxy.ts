//proxy for store
//proxy.prop and proxy.prop = value syntax

import { Store } from "./store.ts";

export function $proxy <Props extends Record<string, any>> (store: Store<Props>) {
	return new Proxy(store, handler) as any as Props
}

const handler = {
	get (store, prop) {
		return store.get(prop)
	},
	set (store, prop, value) {
		store.set(prop, value);
		return true
	},
	has	(store, prop) {
		return store.has(prop)
	}
} satisfies ProxyHandler<Store<any>>;