import type { IfAction } from "../../action/if.ts";
import { throw_attr_no_props } from "../errors.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addIfAttr () {
	addActionAttr('if', (node, attr, value, addAction, options) => {
		const propArgs = attr.match(/\([^)]+\)/)?.[0];
		if (!propArgs) return throw_attr_no_props('if');
		const props = decodeAttrArg(propArgs.slice(1, -1), options).split(',');
		addAction({
			type: 'if', target: getTarget(node), props, 
			fn: toFun(options, 
				props[0] === '...' ? ['comp', 'el', 'context'] : ['comp', 'el', 'context', ...props], 
			value.includes(';') ? value : 'return ' + value) 
		} satisfies IfAction);
		removeAttr(node, attr);
	})
}