import type { ConstructorFor } from "../../common/types.ts";
import type { Component } from "../core/comp.ts";
import { createChunk, isDefered, type ChunkBuild } from "./chunk.ts";

export function defer (fn: (el: HTMLElement, comp: Component) => void) {
	(fn as any)[isDefered] = true;
	return fn;
}

export function wrapWith (comp: ConstructorFor<Component>, ...args: any) {
	return defer((el, parent) => {
		let child = new comp(el, ...args);
		child.onInit.listen(() => parent.addChild(child));
	});
}

export function $async (comp: Component, builder:
	(build: Omit<ChunkBuild, 'end'>, fallback: (el: HTMLElement) => void) => Promise<void>
) {
	let build = createChunk(comp, undefined, comp.view.options.liteConverters);
	let el = document.createElement('span');
	(async () => {
		await builder(build, (fallback) => el = fallback);
		el.replaceWith(build.end());
	})();
	return el;
}