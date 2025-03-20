import type { fn } from "../../common/types.ts";
import { get } from "../core/registry.ts";
import type { TName } from "../view/actAttrs/utils.ts";
import { addAction, type Action } from "./actions.ts";

export interface CompThisAction extends Action {
	type: 'comp:this';
	comp: TName;
}

export function addCompAction () {
	addAction('comp:this', (comp, el, action, context) => {
		const { type, value } = (action as CompThisAction).comp;
		const name = 
		  type === 'literial' ? value : 
		  type === 'prop' ? comp.get(value) : 
		  (value as fn)(comp, el, context);
		const child = new (get(name))(el);
		child.onInit.on((child) => comp.addChild(child));
	})
}  