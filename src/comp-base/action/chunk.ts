import type { fn } from "../../common/types.ts";
import type { Fn } from "../view/walkInterface.ts";
import { addAction, type Action } from "./actions.ts";

export interface ChunkAction extends Action {
	type: 'chunk',
	name: string,
	context: Fn,
}

export function addChunkAction () {
	addAction('chunk', (comp, el, _action, context) => {
		const action = _action as ChunkAction;
		const chunk = comp.view.constructChunk(action.name, (action.context as fn)(comp, el, context));
		el.replaceChildren(...chunk.childNodes);
	})
}