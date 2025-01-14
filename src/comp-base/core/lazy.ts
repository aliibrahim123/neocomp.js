//lazy component

import { OTIEvent } from "../../common/event.ts";
import { attachedComp, type AnyComp } from "./comp.ts";
import { onAdd } from "./globalEvents.ts";
import { addProvider, get, has, registry } from "./registry.ts";

export class LazyComp {
	el: HTMLElement | undefined;
	constructor (name: string, el?: HTMLElement) {
		this.el = el;
		if (el) (el as any)[attachedComp] = this;
		onAdd.on((added, constructor) => {
			if (added !== name) return;
			const comp = new constructor(this.el);
			if (registry.root === this as any) registry.root = comp;
			this.onInit.trigger(comp);
		})
	}
	onInit = new OTIEvent<(comp: AnyComp) => void>();
}

addProvider('lazy', (name) => {
	if (has(name)) return get(name);
	return function (el: HTMLElement) {
		return new LazyComp(name, el)
	} as any
})