// attribute actions

import type { fn } from "../../common/types.ts";
import type { PureComp } from "../core/comp.ts";
import type { TAttr } from "../view/tempAttr.ts";
import { evalTAttr } from "../view/tempAttr.ts"
import { addAction, type Action } from "./actions.ts";

export interface AttrAction extends Action {
	type: 'attr';
	attr: string;
	template: TAttr;
	autoTrack: boolean;
	staticProps: string[];
	dynamicProps: string[]
}

export const passedArgs = Symbol('neocomp:passed-args');

function setAttr (comp: PureComp, el: HTMLElement, action: AttrAction, context: Record<string, any>) {
	// compute value
	const value = evalTAttr(action.template, comp, el, context,
	  action.staticProps.concat(action.dynamicProps).map(prop => comp.store.get(prop))
	);

	// set attr
	const attr = action.attr;
	if      (attr === 'text') el.innerText = value;
	else if (attr === 'html') el.innerHTML = value;
	else if (attr === 'content') {
		if (Array.isArray(value)) el.replaceChildren(...value);
		else el.replaceChildren(value === undefined ? '' : value);
	}
	else if (attr.startsWith('prop:')) (el as any)[attr.slice(5)] = value;
	else if (attr.startsWith('bool:')) el.toggleAttribute(attr.slice(5), !!value);
	else if (attr.startsWith('class:')) el.classList.toggle(attr.slice(6), !!value);
	else if (attr.startsWith('style:')) el.style.setProperty(attr.slice(6), value);
	else if (attr.startsWith('arg:')) {
		if (!(el as any)[passedArgs]) (el as any)[passedArgs] = {};
		(el as any)[passedArgs][attr.slice(4)] = value
	}
	else el.setAttribute(attr, value);
}

export function addAttrAction () {
	addAction('attr', (comp, el, _action, context) => {
		const action = _action as AttrAction;
		
		// case auto track dependencies
		if (action.autoTrack) comp.store.effect('track', 
			() => setAttr(comp, el, action, context), 
		undefined, undefined, { el });
		
		// cause manual dynamic dependencies
		else if (action.dynamicProps.length > 0 || Array.isArray(action.template) && action.template.some(
			part => typeof(part) !== 'string' && (part.isExp ? part.dynamics.length > 0 : !part.static)
		)) {
			// collect dynamic props
			const dynamicProps = new Set(action.dynamicProps);
			if (Array.isArray(action.template)) 
			  for (const part of action.template) if (typeof(part) !== 'string') {
				if (part.isExp) 
				  for (const prop of part.dynamics) dynamicProps.add(prop);
				else if (!part.static) dynamicProps.add(part.prop);
			  }
			// add effect
			comp.store.effect(
			  Array.from(dynamicProps), () => setAttr(comp, el, action, context), [], undefined, { el }
			);
		}

		// case no dependencies
		else setAttr(comp, el, action, context);
	})
}
