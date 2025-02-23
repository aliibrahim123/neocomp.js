//attribute actions

import type { fn } from "../../common/types.ts";
import type { PureComp } from "../core/comp.ts";
import type { TAttr } from "../view/tempAttr.ts";
import { evalTAttr, type TAttrExp, type TAttrPart, type TAttrProp } from "../view/tempAttr.ts"
import { addAction, type Action } from "./actions.ts";

export interface AttrAction extends Action {
	type: 'attr';
	attr: string;
	template: TAttr;
	staticProps: string[];
	dynamicProps: string[]
}

export const passedArgs = Symbol('neocomp:passed-args');

function setAttr (comp: PureComp, el: HTMLElement, action: AttrAction) {
	//compute value
	const value = evalTAttr(action.template, comp, el, 
	  action.staticProps.concat(action.dynamicProps).map(prop => comp.store.get(prop))
	)

	//set attr
	const attr = action.attr;
	if      (attr === 'text') el.innerText = value;
	else if (attr === 'html') el.innerHTML = value;
	else if (attr.startsWith('prop:')) (el as any)[attr.slice(5)] = value;
	else if (attr.startsWith('class:')) el.classList.toggle(attr.slice(6), !!value);
	else if (attr.startsWith('style:')) el.style.setProperty(attr.slice(6), value);
	else if (attr.startsWith('arg:')) {
		if (!(el as any)[passedArgs]) (el as any)[passedArgs] = {};
		(el as any)[passedArgs][attr.slice(4)] = value
	}
	else el.setAttribute(attr, value);
}

export function addAttrAction () {
	addAction('attr', (comp, el, _action) => {
		const action = _action as AttrAction;
		//initial set
		setAttr(comp, el, action);
		//if has dynamic props
		if (action.dynamicProps.length > 0 || Array.isArray(action.template) && action.template.some(
			part => typeof(part) !== 'string' && (part.isExp ? part.dynamics.length > 0 : !part.static)
		)) {
			//collect dynamic props
			const dynamicProps = action.dynamicProps.concat();
			if (Array.isArray(action.template)) 
			  for (const part of action.template) if (typeof(part) !== 'string') {
				if (part.isExp) dynamicProps.push(...part.dynamics);
				else if (!part.static) dynamicProps.push(part.prop);
			  }
			//add effect
			comp.store.addEffect(dynamicProps, () => setAttr(comp, el, action), [], undefined, { el });
		}
	})
}
