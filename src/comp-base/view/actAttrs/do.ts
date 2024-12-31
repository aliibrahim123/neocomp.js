import type { DoAction } from "../../action/do.ts";
import { getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addDoAttr () {
	addActionAttr('do', (node, attr, value, actions, options) => {
		actions.push({ 
			type: 'do', target: getTarget(node), fn: toFun(options, ['comp', 'el'], value) 
		} satisfies DoAction);
		removeAttr(node, attr);
	})
}