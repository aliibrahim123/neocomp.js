import type { EffectAction } from "../../action/effect.ts";
import { throw_attr_no_props } from "../errors.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addEffectAttr () {
	addActionAttr('effect', (node, attr, value, addAction, options) => {
		const propArgs = attr.match(/\([^)]+\)/)?.[0];
		if (!propArgs) return throw_attr_no_props('effect');
		const props = decodeAttrArg(propArgs.slice(1, -1), options).split(',');
		addAction({
			type: 'effect', target: getTarget(node), props, 
			fn: toFun(options, ['comp', 'el', 'context', ...props], value) 
		} satisfies EffectAction);
		removeAttr(node, attr);
	})
}