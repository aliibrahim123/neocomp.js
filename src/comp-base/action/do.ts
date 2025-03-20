import type { fn } from "../../common/types.ts";
import type { Fn } from "../view/walkInterface.ts";
import { addAction, type Action } from "./actions.ts";

export interface DoAction extends Action {
	type: 'do',
	fn: Fn
}

export function addDoAction () {
	addAction('do', (comp, el, _action, context) => {
		const action = _action as DoAction;
		(action.fn as fn)(comp, el, context);
	})
}