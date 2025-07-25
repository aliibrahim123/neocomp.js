import type { fn } from "../../common/types.ts";
import type { TName } from "../view/actAttrs/utils.ts";
import { addAction } from "./actions.ts";
import type { Action } from "./actions.ts";

export interface RefAction extends Action {
	type: 'ref',
	name: TName
}

export function addRefAction () {
	addAction('ref', (comp, el, _action, context) => {
		const action = _action as RefAction;
		const { type, value } = action.name;
		const name: string = 
		  type === 'literial' ? value : 
		  type === 'prop' ? comp.get(value) : 
		  (value as fn)(comp, el, context);
		//syntax: name[]
		if (name.endsWith('[]')) comp.view.addRef(name.slice(0, -2), [el]);
		
		else comp.view.addRef(name, el);
	})
}