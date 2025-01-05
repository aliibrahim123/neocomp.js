import { $in, $inout } from '../state/inout.ts';
import { attachedComp, type PureComp } from '../core/comp.ts'
import { addAction, type Action } from "./actions.ts";
import { throw_no_attached_comp } from './errors.ts';

export interface InOutAction extends Action {
	type: 'in' | 'out' | 'inout',
	parentProp: string,
	childProp: string
}

export function addInOutActions () {
	function addAct (name: InOutAction['type'], fn: 
		(action: InOutAction, parent: PureComp, child: PureComp) => void
	) {
	  addAction(name, (comp, el, _action) => {
		const action = _action as InOutAction;
		//defer
		setTimeout(() => {
			const child = (el as any)[attachedComp] as PureComp;
			if (!child) throw_no_attached_comp(comp, name);
			//wait to init
			child.onInit.on((child) => fn(action, comp, child)); 
		}, 0);
	  });
	}

	addAct('in', (action, parent, child) => 
		$in(parent, action.parentProp, child, action.childProp)
	);
	addAct('out', (action, parent, child) => 
		$in(child, action.childProp, parent, action.parentProp)
	);
	addAct('inout', (action, parent, child) => 
		$inout(parent, action.parentProp, child, action.childProp)
	);
}