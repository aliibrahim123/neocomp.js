//lightweight representation for actions of element

import { LiteNode } from "../../litedom/node.ts";
import type { AnyComp, PureComp } from "../core/comp.ts";
import { addAttrAction } from "./attr.ts";
import { addCompAction } from "./comp.ts";
import { addDoAction } from "./do.ts";
import { addEffectAction } from "./effect.ts";
import { throw_adding_existing_action, throw_undefined_action } from "./errors.ts";
import { addInOutActions } from "./inout.ts";
import { addOnAction } from "./on.ts";
import { addRefAction } from "./ref.ts";

export interface Action {
	type: string,
	target: number | HTMLElement,
	[unkown: string]: any
}

type Handler = (comp: PureComp, el: HTMLElement, action: Action) => void;
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

function doAction (comp: AnyComp, el: HTMLElement, action: Action) {
	const handler = registry.get(action.type);
	if (!handler) return throw_undefined_action(action.type);
	handler(comp as PureComp, el, action);
}
export function doActions (comp: AnyComp, actions: Action[]) {
	for (const action of actions) doAction(comp, action.target as HTMLElement, action);
}
//works since actions are grouped in parent->child order
export function doActionsOfTemplate (
	comp: AnyComp, top: HTMLElement, liteTop: LiteNode, actions: Action[]
) {
	let ind = 0;

	function walk (native: HTMLElement, lite: LiteNode) {
		const curId = lite.meta.get('neocomp:id') as number;
		while (actions[ind]?.target === curId) {
			doAction(comp, native, actions[ind]);
			ind++;
		}
		if (actions[ind] === undefined) return;
		for (let j = 0, i = 0; j < lite.children.length; j++) 
		  if (lite.children[j] instanceof LiteNode && actions[ind] !== undefined) {
			walk(native.children[i] as HTMLElement, lite.children[j] as LiteNode);
			i++;
		}
	}

	walk(top, liteTop);
}