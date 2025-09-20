import type { fn } from "../../common/types.ts";
import { addAction, type Action } from "./actions.ts";

export interface EffectAction extends Action {
	type: 'effect',
	fn: fn,
	props: string[]
}

export function addEffectAction () {
	addAction('effect', (comp, el, _action, context) => {
		const action = _action as EffectAction;
		
		// case auto track dependencies
		if (action.props[0] === '...') 
			comp.store.effect('track', () => action.fn(comp, el, context), undefined, undefined, { el });

		// case manual dependencies
		else comp.store.effect(action.props, 
			() => action.fn(comp, el, context, ...action.props.map(prop => comp.store.get(prop))),
		[], undefined, { el });
	})
}