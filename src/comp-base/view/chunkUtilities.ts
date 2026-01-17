import type { ConstructorFor } from "../../common/types.ts";
import { Signal } from "../state/signal.ts";
import type { Component } from "../core/comp.ts";
import { isDefered, type ChunkBuild } from "./chunk.ts";
import { diff } from "../state/arr.ts";

/** syntax sugar for external chunks */
export function snippet (builder: (build: ChunkBuild, comp: Component) => void) {
	let fn = (el: Element, comp: Component) => {
		let build = comp.view.createChunk();
		builder(build, comp);
		return build.end();
	};
	(fn as any).isSnippet = true;
	return fn
}

/** defer an action */
export function defer (fn: (el: HTMLElement, comp: Component) => void) {
	(fn as any)[isDefered] = true;
	return fn;
}

/** wrap the element with a component */
export function wrapWith (comp: ConstructorFor<Component>, ...args: any) {
	return defer((el, parent) => {
		let child = new comp(el, ...args);
		child.onInit.listen(() => parent.addChild(child));
	});
}

/** asyncrounesly build a chunk */
export function $async (comp: Component, builder:
	(build: Omit<ChunkBuild, 'end'>, fallback: (el: HTMLElement) => void) => Promise<void>
) {
	let build = comp.view.createChunk();
	let el = document.createElement('span');
	(async () => {
		await builder(build, (fallback) => el = fallback);
		el.replaceWith(build.end());
	})();
	return el;
}

/** show an element based on a reactive value */
export function showIf (inp: Signal<boolean> | ((el: HTMLElement, comp: Component) => boolean)) {
	return (el: HTMLElement, comp: Component) => {
		if (inp instanceof Signal) comp.store.effect( 
			() => el.style.display = inp.value ? '' : 'none'
		);
		else comp.store.effect(
			() => el.style.display = inp(el, comp) ? '' : 'none'
		);
	}
}

interface ItemData<T> {
	index: number
	indexSignal?: Signal<number>
	remove: () => void
}
/** dynamicaly render a reactive list */
export function renderList<T> (
	signal: Signal<T[]>,
	builder: (build: Omit<ChunkBuild, 'end'>, item: T, index: number) => void,
	dynIndex?: false
): (el: HTMLElement, comp: Component) => void;
export function renderList<T> (
	signal: Signal<T[]>,
	builder: (build: Omit<ChunkBuild, 'end'>, item: T, index: Signal<number>) => void,
	dynIndex: true
): (el: HTMLElement, comp: Component) => void;
export function renderList<T> (
	signal: Signal<T[]>,
	builder: (build: Omit<ChunkBuild, 'end'>, item: T, index: any) => void,
	dynIndex = false
) {
	return (el: HTMLElement, comp: Component) => {
		let store = comp.store;
		let old = signal.peek();
		let firstTime = true;
		let itemsData: ItemData<T>[] = [];

		store.effect([signal], [], () => {
			let New = signal.value;
			let curData = [] as ItemData<T>[];

			diff(firstTime ? [] : old, New, (type, index, value, oldInd) => {
				// case no change, update value or index
				if (type === 'none') {
					let item = itemsData[oldInd];
					if (item.indexSignal && item.index !== index) item.indexSignal.value = index;

					// readd to items
					item.index = index;
					curData.push(item);
				}
				// case remove
				if (type === 'remove' || type === 'change') {
					itemsData[oldInd].remove();
				}
				// case add
				if (type === 'add' || type === 'change') {
					let chunk = comp.view.createChunk(undefined, true);

					let indexSignal = dynIndex ? store.signal(index) : undefined;

					builder(chunk, value, dynIndex ? indexSignal : index);
					let child = chunk.end();
					if (index === 0) el.prepend(child); else el.children[index - 1].after(child);

					curData.push({ index, indexSignal, remove: chunk.remove });
				}
			});
			firstTime = false;
			old = New.concat();
			itemsData = curData;
		})
	}
}