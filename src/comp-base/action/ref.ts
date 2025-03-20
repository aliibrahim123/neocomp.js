import type { fn } from "../../common/types.ts";
import type { TName } from "../view/actAttrs/utils.ts";
import type { Fn } from "../view/walkInterface.ts";
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
		const name = 
		  type === 'literial' ? value : 
		  type === 'prop' ? comp.get(value) : 
		  (value as fn)(comp, el, context);
		comp.view.addRef(name, el);
	})
}