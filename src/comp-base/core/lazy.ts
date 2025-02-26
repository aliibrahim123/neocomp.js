//lazy component

import { OTIEvent } from "../../common/event.ts";
import { attachedComp, type PureComp } from "./comp.ts";
import { onAdd } from "./globalEvents.ts";
import { addProvider, get, has, registry } from "./registry.ts";

export class LazyComp {
	el: HTMLElement | undefined;
	#args: any[];
	constructor (name: string, el?: HTMLElement, ...args: any[]) {
		this.el = el;
		this.#args = args;
		if (el) (el as any)[attachedComp] = this;
		onAdd.on((added, constructor) => {
			if (added !== name) return;
			const comp = new constructor(this.el, ...this.#args);
			if (registry.root === this as any) registry.root = comp as any;
			this.onInit.trigger(comp);
		})
	}
	onInit = new OTIEvent<(comp: PureComp) => void>();
}

addProvider('lazy', (name) => {
	if (has(name)) return get(name);
	return function (el: HTMLElement, ...args: any[]) {
		return new LazyComp(name, el, ...args)
	} as any
})