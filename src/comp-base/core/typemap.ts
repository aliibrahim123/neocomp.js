//group types for components

import type { PureComp, Component } from "./comp.ts";

export interface BaseMap {
	props: Record<string, any>,
	refs: Record<string, HTMLElement | HTMLElement[]>,
	childmap: Record<string, PureComp>,
	chunks: string
}

export type getTypeMap <Comp> = Comp extends Component<infer TMap> ? TMap : never;
export type getProps <Comp> = getTypeMap<Comp>['props'];
export type getRefs <Comp> = getTypeMap<Comp>['refs'];
export type getChildMap <Comp> = getTypeMap<Comp>['childmap'];
export type getChunks <Comp> = getTypeMap<Comp>['chunks'];
