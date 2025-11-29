// lazy component

import { OTIEvent, type ListenerOf } from "../../common/event.ts";
import { attachedComp, Component } from "./comp.ts";
import { onAdd } from "./globalEvents.ts";
import { addProvider, get, has, registry } from "./registry.ts";

/** a component for lazy loaded components */
export class LazyComp {
	el: HTMLElement | undefined;
	#args: any[];
	constructor (name: string, el?: HTMLElement, ...args: any[]) {
		this.el = el;
		this.#args = args;
		if (el) (el as any)[attachedComp] = this;
		const listener: ListenerOf<typeof onAdd> = (added, constructor) => {
			if (added !== name) return;
			const comp = new constructor(this.el, ...this.#args);
			if (registry.root === this as any) registry.root = comp as any;
			comp.onInit.listen(comp => this.onInit.trigger(comp));
			onAdd.unlisten(listener);
		}
		onAdd.listen(listener);
	}
	/** event triggered when the component is initialized */
	onInit = new OTIEvent<(comp: Component) => void>();
}

addProvider('lazy', (name) => {
	if (has(name)) return get(name);
	return function (el: HTMLElement, ...args: any[]) {
		return new LazyComp(name, el, ...args)
	} as any
})