import type { fn } from "../../common/types.ts";
import type { Fn } from "../view/walkInterface.ts";
import { addAction, type Action } from "./actions.ts";

export interface EffectAction extends Action {
	type: 'effect',
	fn: Fn,
	props: string[]
}

export function addEffectAction () {
	addAction('effect', (comp, el, _action, context) => {
		const action = _action as EffectAction;
		(action.fn as fn)(comp, el, ...action.props.map(prop => comp.store.get(prop)));
		comp.store.addEffect(action.props, 
			() => (action.fn as fn)(comp, el, context, ...action.props.map(prop => comp.store.get(prop))),
		[], undefined, { el });
	})
}