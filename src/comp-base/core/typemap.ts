//group types for components

import type { Component } from "./comp.ts";

export type BaseMap = {
	props: Record<string, any>,
	refs: Record<string, HTMLElement>
}

export type Satisfies <Base extends BaseMap, T extends Base> = T;

export type getTypeMap <Comp> = Comp extends Component<infer M> ? M : never;
export type getProps <Comp> = getTypeMap<Comp>['props']