//group types for components

import type { AnyComp } from "./comp.ts";

export type BaseMap = {
	props: Record<string, any>,
	refs: Record<string, HTMLElement>,
	childmap: Record<string, AnyComp>
}

export type Satisfies <Base extends BaseMap, T extends Base> = T;

export type getTypeMap <Comp extends AnyComp> = Comp['typemap'];
export type getProps <Comp extends AnyComp> = getTypeMap<Comp>['props'];
export type getRefs <Comp extends AnyComp> = getTypeMap<Comp>['refs'];
export type getChildMap <Comp extends AnyComp> = getTypeMap<Comp>['childmap'];