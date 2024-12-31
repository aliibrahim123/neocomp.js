//attribute actions

import type { fn } from "../../common/types.ts";
import type { PureComp } from "../core.ts";
import type { TAttrExp, TAttrParts, TAttrProp } from "../view/tempAttr.ts"
import { addAction, type Action } from "./actions.ts";

export interface AttrAction extends Action {
	type: 'attr';
	attr: string;
	parts: TAttrParts;
	staticProps: string[];
	dynamicProps: string[]
}

function setAttr (comp: PureComp, el: HTMLElement, action: AttrAction) {
	//compute value
	const value = action.parts.map(part => {
		//string
		if (typeof(part) === 'string') return part;
		//prop
		if (!part.isExp) return comp.store.get(part.prop);
		//exp
		return (part.fn as fn)(comp, el, 
		  ...action.staticProps.concat(action.dynamicProps, part.statics, part.dynamics)
			.map(prop => comp.store.get(prop))
		);
	}).join('');

	//set attr
	const attr = action.attr;
	if      (attr === 'text') el.innerText = value;
	else if (attr === 'html') el.innerHTML = value;
	else if (attr.startsWith('prop:')) (el as any)[attr.slice(5)] = value;
	else if (attr.startsWith('style:')) el.style.setProperty(attr.slice(6), value);
	else el.setAttribute(attr, value);
}

export function addAttrAction () {
	addAction('attr', (comp, el, _action) => {
		const action = _action as AttrAction;
		//initial set
		setAttr(comp, el, action);
		//if has dynamic props
		if (action.dynamicProps.length > 0 || action.parts.some(
			part => typeof(part) !== 'string' && (part.isExp ? part.dynamics.length > 0 : !part.static)
		)) {
			//collect dynamic props
			const dynamicProps = action.dynamicProps.concat(); 
			for (const part of action.parts) if (typeof(part) !== 'string') {
				if (part.isExp) dynamicProps.push(...part.dynamics);
				else if (!part.static) dynamicProps.push(part.prop);
			}
			//add effect
			comp.store.addEffect(dynamicProps, () => setAttr(comp, el, action), [], undefined, { el });
		}
	})
}