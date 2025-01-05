//action attributes: attributes holding actions

import type { Action } from "../../action/actions.ts";
import { throw_adding_existing_act_attr, throw_getting_undefined_act_attr } from "../errors.ts";
import type { WalkOptions } from "../walker.ts";
import type { Node } from "../walkInterface.ts";
import { addDoAttr } from "./do.ts";
import { addEffectAttr } from "./effect.ts";
import { addInOutAttrs } from "./inout.ts";
import { addOnAttr } from "./on.ts";
import { addRefAttr } from "./ref.ts";

type Handler = (
	node: Node, attr: string, value: string, actions: Action[], options: WalkOptions
) => any;
const registry = new Map<string, Handler>();

export function addActionAttr (name: string, handler: Handler) {
	if (registry.has(name)) throw_adding_existing_act_attr(name);
	registry.set(name, handler);
}

export function getActionAttr (name: string) {
	if (!registry.has(name)) throw_getting_undefined_act_attr(name);
	return registry.get(name) as Handler
}

addRefAttr();
addDoAttr();
addEffectAttr();
addOnAttr();
addInOutAttrs();