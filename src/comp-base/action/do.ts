import type { fn } from "../../common/types.ts";
import { addAction, type Action } from "./actions.ts";

export interface DoAction extends Action {
	type: 'do',
	fn: fn
}

export function addDoAction () {
	addAction('do', (comp, el, _action, context) => {
		const action = _action as DoAction;
		action.fn(comp, el, context);
	})
}