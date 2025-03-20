import type { RefAction } from "../../action/ref.ts";
import { getTarget, removeAttr } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";
import { parseTName } from "./utils.ts";

export function addRefAttr () {
	addActionAttr('ref', (node, attr, value, addAction, options) => {
		addAction({ 
		  type: 'ref', target: getTarget(node), name: parseTName(value, options) 
		} satisfies RefAction);
		removeAttr(node, attr);
	});
}