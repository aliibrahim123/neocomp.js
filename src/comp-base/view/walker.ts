//walk the dom and gather actions
//works on lite and native

import type { Action } from "../action/actions.ts";
import type { AttrAction } from "../action/attr.ts";
import type { CompThisAction } from "../action/comp.ts";
import { getActionAttr } from "./actAttrs/index.ts";
import { throw_comp_this_multiple, throw_tattr_no_text, throw_tattr_unended_prop_args_in_name } from "./errors.ts";
import { parseTAttr } from "./tempAttr.ts";
import { 
	hasAttr, attrsOf, decodeAttrArg, setAttr, removeAttr, getTarget, childrenOf,
	getText
} from "./walkInterface.ts";
import type { Node } from "./walkInterface.ts";

export interface WalkOptions {
	serialize: boolean;
	inDom: boolean;
}
const defalutOptions: WalkOptions = {
	serialize: false,
	inDom: false,
}
export function walk (node: Node, options: Partial<WalkOptions> = {}) {
	return Walk(node, [], { ...defalutOptions, ...options });
}

function handleTAttr (
	node: Node, attr: string, value: string, options: WalkOptions, actions: Action[]
) {
	const paranInd = attr.indexOf('('), hasProps = paranInd !== -1;
	const name = attr.slice(1, hasProps ? paranInd : attr.length);

	const staticProps: string[] = [], dynamicProps: string[] = [];
	if (hasProps) {
		//get props end
		const paranEnd = attr.indexOf(')', paranInd);
		if (paranEnd === -1) throw_tattr_unended_prop_args_in_name(attr);

		//get props
		const props = decodeAttrArg(attr.slice(paranInd +1, paranEnd), options).split(',');
		for (const prop of props) 
			if (prop[0] === '$') staticProps.push(prop.slice(1));
			else dynamicProps.push(prop);
	}

	//case text
	if (name === 'text') {
		const text = getText(node);
		if (text === undefined) return throw_tattr_no_text(attr);
		value = text;
	}

	//parse attr
	const parts = parseTAttr(value, attr, options, ['comp', 'el'].concat(staticProps, dynamicProps));

	//case const and doesnt need runtime handling, set it directly
	if (
		!(name === 'text' || name.startsWith('style:') || name.startsWith('prop:'))
		&& parts.every(part => typeof(part) === 'string')
	) setAttr(node, name, parts.join(''));

	//else add action
	else actions.push({
		type: 'attr',
		target: getTarget(node),
		attr: name,
		parts, staticProps, dynamicProps
	} satisfies AttrAction);
	
	removeAttr(node, attr);
}

function Walk (node: Node, actions: Action[], options: WalkOptions): Action[] {
	//case static, skip
	if (hasAttr(node, 'is:static')) return actions;
	//for debugging
	(walk as any).lastVisited = node;
	//defer it if found
	let compThisAct: undefined | CompThisAction;

	for (const [attr, value] of Array.from(attrsOf(node))) {
		//case templated attr
		if (attr[0] === ':') handleTAttr(node, attr, value, options, actions);
		//case @comp:this
		else if (attr === '@comp:this') {
			if (compThisAct) throw_comp_this_multiple();
			compThisAct = { type: 'comp:this', target: getTarget(node), comp: value };
			removeAttr(node, attr);
		}
		//case act attr
		else if (attr[0] === '@') {
			const name = attr.split(/[:(\[]/, 1)[0].slice(1);
			getActionAttr(name)(node, attr, value, actions, options);
		}
	}

	if (compThisAct) {
		actions.push(compThisAct);
		return actions;
	}

	//walk children
	for (const child of childrenOf(node)) Walk(child, actions, options);
	return actions
}
