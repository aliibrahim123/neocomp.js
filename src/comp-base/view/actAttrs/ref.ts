import type { RefAction } from "../../action/ref.ts";
import { getTarget, removeAttr } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addRefAttr () {
	addActionAttr('ref', (node, attr, value, actions) => {
		actions.push({ type: 'ref', target: getTarget(node), name: value } satisfies RefAction);
		removeAttr(node, attr);
	});
}