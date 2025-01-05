import type { OnAction } from "../../action/on.ts";
import { throw_on_attr_no_args } from "../errors.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addOnAttr () {
	addActionAttr('on', (node, attr, value, actions, options) => {
		const eventArgs = attr.match(/\([^)]+\)/)?.[0];
		if (!eventArgs) return throw_on_attr_no_args();
		const events = eventArgs.slice(1, -1).split(',');
		actions.push({
			type: 'on', target: getTarget(node), events,
			fn: toFun(options, ['comp', 'el', 'event'], value) 
		} satisfies OnAction);
		removeAttr(node, attr);
	})
}