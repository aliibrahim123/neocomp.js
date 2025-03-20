import type { DoAction } from "../../action/do.ts";
import { getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addDoAttr () {
	addActionAttr('do', (node, attr, value, addAction, options) => {
		addAction({ 
			type: 'do', target: getTarget(node), fn: toFun(options, ['comp', 'el', 'context'], value) 
		} satisfies DoAction);
		removeAttr(node, attr);
	})
}