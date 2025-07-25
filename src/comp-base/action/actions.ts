//lightweight representation for actions of element

import { LiteNode } from "../../litedom/node.ts";
import type { PureComp } from "../core/comp.ts";
import { throw_adding_existing_action, throw_undefined_action } from "./errors.ts";
import { addAttrAction } from "./attr.ts";
import { addChunkAction } from "./chunk.ts";
import { addCompAction } from "./comp.ts";
import { addDoAction } from "./do.ts";
import { addEffectAction } from "./effect.ts";
import { addInOutActions } from "./inout.ts";
import { addOnAction } from "./on.ts";
import { addRefAction } from "./ref.ts";
import { addIfAction } from "./if.ts";

export interface Action {
	type: string,
	target: number | HTMLElement,
	[unkown: string]: any
}

type Handler = (
  comp: PureComp, el: HTMLElement, action: Action, context: Record<string, any>
) => void;
const registry = new Map<string, Handler>();

export function addAction (name: string, handler: Handler) {
	if (registry.has(name)) throw_adding_existing_action(name);
	registry.set(name, handler);
}

addAttrAction();
addCompAction();
addRefAction();
addDoAction();
addEffectAction();
addOnAction();
addInOutActions();
addChunkAction();
addIfAction();

function doAction (comp: PureComp, el: HTMLElement, action: Action, context: Record<string, any>) {
	const handler = registry.get(action.type);
	if (!handler) return throw_undefined_action(action.type);
	handler(comp, el, action, context);
}
export function doActions (comp: PureComp, actions: Action[], context: Record<string, any>) {
	for (const action of actions) doAction(comp, action.target as HTMLElement, action, context);
}
//works since actions are grouped in parent->child order
export function doActionsOfTemplate (
	comp: PureComp, top: HTMLElement, liteTop: LiteNode, actions: Action[], context: Record<string, any> = {}
) {
	let ind = 0;

	function walk (native: HTMLElement, lite: LiteNode) {
		const curId = lite.meta.get('neocomp:id') as number;
		while (actions[ind]?.target === curId) {
			doAction(comp, native, actions[ind], context);
			ind++;
		}
		if (actions[ind] === undefined) return;
		for (let j = 0, i = 0; j < lite.children.length; j++) 
		  if (lite.children[j] instanceof LiteNode && actions[ind] !== undefined) {
			walk(native.children[i] as HTMLElement, lite.children[j] as LiteNode);
			i++
		}
	}

	walk(top, liteTop);
}

export function infoDump (type: 'actions') {
	if (type === 'actions') return Array.from(registry.keys());
}