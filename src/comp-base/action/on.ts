import type { fn } from "../../common/types.ts";
import type { Fn } from "../view/walkInterface.ts";
import { addAction, type Action } from "./actions.ts";

export interface OnAction extends Action {
	type: 'on',
	fn: Fn,
	events: string[]
}

export function addOnAction () {
	addAction('on', (comp, el, _action, context) => {
		const action = _action as OnAction;
		for (const event of action.events) 
			el.addEventListener(event, (evt) => (action.fn as fn)(comp, el, context, evt));
	})
}