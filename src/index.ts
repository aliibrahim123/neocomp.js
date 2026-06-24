import { ChunkBuild, RemovableChunk } from './chunk.ts';
import { Store, StoreProv } from './reactive.ts';

export class Context extends StoreProv {
	#store = new Store();
	root_el: Element;
	constructor(root_el: Element) {
		super();
		this.root_el = root_el;
		super.init(this, undefined);
	}

	override get store(): Store {
		return this.#store;
	}

	new_chunk(base_el: Element) {
		return new ChunkBuild(this, base_el);
	}
	root_chunk() {
		return new ChunkBuild(this, this.root_el);
	}
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
