import type { InOutAction } from "../../action/inout.ts";
import { throw_attr_no_props } from "../errors.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addInOutAttrs () {
	function addAttr (name: 'in' | 'out' | 'inout') {
	  addActionAttr(name, (node, attr, value, actions, options) => {
		const parentPropArg = attr.match(/\([^)]+\)/)?.[0];
		if (!parentPropArg) return throw_attr_no_props(name);
		const parentProp = decodeAttrArg(parentPropArg.slice(1, -1), options);
		actions.push({
			type: name, target: getTarget(node), parentProp, childProp: value 
		} satisfies InOutAction);
		removeAttr(node, attr);
	  });
	}

	addAttr('in');
	addAttr('out');
	addAttr('inout');
}