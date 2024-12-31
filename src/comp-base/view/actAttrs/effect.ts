import type { EffectAction } from "../../action/effect.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addEffectAttr () {
	addActionAttr('effect', (node, attr, value, actions, options) => {
		const propArgs = attr.match(/\([^)]+\)/)?.[0];
		if (!propArgs) return;
		const props = decodeAttrArg(propArgs.slice(1, -1), options).split(',');
		actions.push({
			type: 'effect', target: getTarget(node), props, 
			fn: toFun(options, ['comp', 'el', ...props], value) 
		} satisfies EffectAction);
		removeAttr(node, attr);
	})
}