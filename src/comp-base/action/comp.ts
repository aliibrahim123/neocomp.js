import { get } from "../core/registry.ts";
import { addAction, type Action } from "./actions.ts";

export interface CompThisAction extends Action {
	type: 'comp:this';
	comp: string;
}

export function addCompAction () {
	addAction('comp:this', (comp, el, action) => {
		const child = new (get((action as CompThisAction).comp))(el);
		comp.addChild(child);
	})
}  