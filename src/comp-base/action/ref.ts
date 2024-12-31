import { addAction } from "./actions.ts";
import type { Action } from "./actions.ts";

export interface RefAction extends Action {
	type: 'ref',
	name: string
}

export function addRefAction () {
	addAction('ref', (comp, el, _action) => {
		const action = _action as RefAction;
		comp.view.addRef(action.name, el);
	})
}