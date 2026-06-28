import { ChunkBuild, RemovableChunk } from './chunk.ts';
import { Store, StoreProv } from './reactive.ts';

/** the root of the ui.
 *
 * the `Context` is a type that wraps a root element and creates a reactive ui system around it.
 *
 * it is a {@linkcode StoreProv} that redirects the common methods of the {@linkcode Store} in the global scope, and it provides different methods to create ui chunks.
 */
export class Context extends StoreProv {
	#store = new Store();
	/** the root element of the ui */
	root_el: Element;
	/** create a new `Context` around a root element */
	constructor(root_el: Element) {
		super();
		this.root_el = root_el;
		super.init(this, undefined);
	}

	/** the ui system {@linkcode Store} */
	override get store(): Store {
		return this.#store;
	}

	/** create a new {@linkcode ChunkBuild} targeting the given element and of global scope */
	new_chunk(base_el: Element) {
		return new ChunkBuild(this, base_el);
	}
	/** create a new {@linkcode ChunkBuild} targeting the root element and of global scope */
	root_chunk() {
		return new ChunkBuild(this, this.root_el);
	}
	/** create a new {@linkcode RemovableChunk} having its own element and its own scope */
	removable_chunk(tag: string) {
		return new RemovableChunk(this, document.createElement(tag), this.store.new_slab());
	}
}

export { ChunkBuild, RemovableChunk, show_if } from './chunk.ts';
export {
	type PropId,
	ROSignal,
	Signal,
	type SlabID,
	Store,
	StoreProv,
	type ReadSignal,
} from './reactive.ts';
export { render_list, render_list_enumerated } from './render_list.ts';
