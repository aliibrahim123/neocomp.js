import { ChunkBuild, RemovableChunk } from './chunk.ts';
import { Store, StoreProv } from './reactive.ts';

export class Context extends StoreProv {
	#store = new Store();
	#root_el: Element;
	constructor(root_el: Element) {
		super();
		this.#root_el = root_el;
		super.init(this, undefined);
	}
	override get store(): Store {
		return this.#store;
	}

	get root_el(): Element {
		return this.#root_el;
	}

	new_chunk(base_el: Element) {
		return new ChunkBuild(this, base_el);
	}
	root_chunk() {
		return new ChunkBuild(this, this.#root_el);
	}
	romovable_chunk(base_el: Element) {
		return new RemovableChunk(this, base_el, this.store.new_slab());
	}
}
