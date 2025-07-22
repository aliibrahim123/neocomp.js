//group types for components

import type { AnyComp } from "./comp.ts";

export interface BaseMap {
	props: Record<string, any>,
	refs: Record<string, HTMLElement | HTMLElement[]>,
	childmap: Record<string, AnyComp>,
	args: Record<keyof any, any>,
	chunks: string[],
}

export type getTypeMap <Comp extends AnyComp> = Comp['typemap'];
export type getProps <Comp extends AnyComp> = getTypeMap<Comp>['props'];
export type getRefs <Comp extends AnyComp> = getTypeMap<Comp>['refs'];
export type getChildMap <Comp extends AnyComp> = getTypeMap<Comp>['childmap'];
export type getArgs <Comp extends AnyComp> = getTypeMap<Comp>['args'];
export type getChunks <Comp extends AnyComp> = getTypeMap<Comp>['chunks'];