import type { ChunkAction } from "../../action/chunk.ts";
import { throw_chunk_attr_no_name } from "../errors.ts";
import { decodeAttrArg, getTarget, removeAttr, toFun } from "../walkInterface.ts";
import { addActionAttr } from "./index.ts";

export function addChunkAttr () {
	addActionAttr('chunk', (node, attr, value, addAction, options) => {
		const nameStart = attr.indexOf(':') + 1;
		if (nameStart === 0) throw_chunk_attr_no_name();
		const name = decodeAttrArg(attr.slice(nameStart), options);
		const exp = value ? (value.includes(';') ? value : 'return ' + value) : 'return {}';
		addAction({ 
			type: 'chunk', target: getTarget(node), name, 
			context: toFun(options, ['comp', 'el', 'context'], exp) 
		} satisfies ChunkAction);
		removeAttr(node, attr);
	})
}