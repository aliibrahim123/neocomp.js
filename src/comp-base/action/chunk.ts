import type { fn } from "../../common/types.ts";
import { addAction, type Action } from "./actions.ts";

export interface ChunkAction extends Action {
	type: 'chunk',
	name: string,
	context: fn,
}

export function addChunkAction () {
	addAction('chunk', (comp, el, _action, context) => {
		const action = _action as ChunkAction;
		const chunk = comp.view.getChunk(action.name);
		context = action.context(comp, el, context);

		// construct chunk
		const root = comp.view.constructChunk(chunk, context);

		// transfer attributes from chunk root to host element
		if (context.effectHost !== false) for (const [attr, value] of chunk.root.attrs) 
			if (attr !== 'id') el.setAttribute(attr, String(value));

		// insert into dom
		el.replaceChildren(...root.childNodes);
	});
}