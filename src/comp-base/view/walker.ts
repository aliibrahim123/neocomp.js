//walk the dom and gather actions
//works on lite and native

import type { fn } from "../../common/types.ts";
import type { Action } from "../action/actions.ts";
import type { AttrAction } from "../action/attr.ts";
import type { CompThisAction } from "../action/comp.ts";
import { type PureComp } from "../core/comp.ts";
import { doActions } from "../action/actions.ts";
import { getActionAttr } from "./actAttrs/index.ts";
import { parseTName } from "./actAttrs/utils.ts";
import { throw_tattr_no_text, throw_tattr_unended_prop_args_in_name } from "./errors.ts";
import { parseTAttr } from "./tempAttr.ts";
import { 
	hasAttr, attrsOf, decodeAttrArg, setAttr, removeAttr, getTarget, childrenOf, getText,
	removeChildren,
	addClass,
	toggleAttr,
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
	let name = attr.slice(1, hasProps ? paranInd : attr.length);
	if (name.startsWith('prop:') || name.startsWith('arg:')) 
		name = decodeAttrArg(name, options);

	let autoTrack = false;
	const staticProps: string[] = [], dynamicProps: string[] = [];
	if (hasProps) {
		//get props end
		const paranEnd = attr.indexOf(')', paranInd);
		if (paranEnd === -1) throw_tattr_unended_prop_args_in_name(attr);

		//get props
		const props = decodeAttrArg(attr.slice(paranInd +1, paranEnd), options).split(',');
		for (const prop of props) if (prop !== '') {
			if (prop === '...') autoTrack = true;
			else if (prop[0] === '$') staticProps.push(prop.slice(1));
			else dynamicProps.push(prop);
		}
	}

	//case text
	if (name === 'text') {
		const text = getText(node);
		if (text === undefined) return throw_tattr_no_text(attr);
		value = text;
		removeChildren(node);
	}

	//parse attr
	const template = 
	  parseTAttr(value, attr, options, ['comp', 'el', 'context'].concat(staticProps, dynamicProps));
	
	//case const and doesnt need runtime handling, set it directly
	const maybeConst = !(
		name === 'html' || name === 'content' || name.startsWith('style:') || name.startsWith('class:') ||
		name.startsWith('prop:') || name.startsWith('arg:')
	);

	//case parted template
	if (maybeConst && Array.isArray(template) && template.every(part => typeof(part) === 'string')) {
		if (name.startsWith('bool:')) toggleAttr(node, name.slice(5), !!template.join(''));
		else setAttr(node, name, template.join(''));
	}

	//else add action
	else actions.push({
		type: 'attr', target: getTarget(node), 
		attr: name, template,
		autoTrack, staticProps, dynamicProps
	} satisfies AttrAction);
	
	removeAttr(node, attr);
}

function Walk (node: Node, actions: Action[], options: WalkOptions): Action[] {
	//case static, skip
	if (hasAttr(node, 'is:static')) return actions;
	//for debugging
	(walk as any).lastVisited = node;

	//defer actions that relay on comp:this action
	let compThisAct: undefined | CompThisAction;
	const deferedActions: Action[] = [];

	for (const [attr, value] of Array.from(attrsOf(node))) {
		//case templated attr
		if (attr[0] === '.') handleTAttr(node, attr, value, options, actions);
		//case @comp:this
		else if (attr === '@comp:this') {
			compThisAct = { type: 'comp:this', target: getTarget(node), comp: parseTName(value, options) };
			removeAttr(node, attr);
		}
		//case act attr
		else if (attr[0] === '@') {
			const name = attr.split(/[:(\[]/, 1)[0].slice(1);
			getActionAttr(name)(node, attr, value, (action, defer = false) => {
				if (defer) deferedActions.push(action);
				else actions.push(action);
			}, options);
		}
	}

	//push comp:this if found then add defered actions
	if (compThisAct) {
		actions.push(compThisAct, ...deferedActions);
		return actions;
	}
	actions.push(...deferedActions);

	//walk children
	for (const child of childrenOf(node)) Walk(child, actions, options);
	return actions
}

export function walkInDom (
	comp: PureComp, el: HTMLElement, context: Record<string, any>, options: Partial<WalkOptions> = {}
) {
	const actions = Walk(el, [], { ...defalutOptions, inDom: true, ...options });
	doActions(comp, actions, context);
}