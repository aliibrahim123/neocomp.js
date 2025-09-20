import type { fn } from "../../common/types.ts";
import { addAction, type Action } from "./actions.ts";

export interface IfAction extends Action {
	props: string[],
	type: 'if',
	fn: fn
}

export function addIfAction () {
	addAction('if', (comp, el, action, context) => {
		const { props, fn } = action as IfAction;
		
		const effect = () => {
			if (fn(comp, el, context, ...props.map(prop => comp.store.get(prop))))
				el.style.display = '';
			else el.style.display = 'none';
		}

		// case auto track dependencies
		if (props[0] === '...') {
			props.pop(); // remove ...
			comp.store.effect('track', effect, undefined, undefined, { el });
		}
		
		// case manual dependencies
		else comp.store.effect(props, effect, [], undefined, { el });
	})
}