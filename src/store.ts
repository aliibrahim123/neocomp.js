export type PropId<T> = number & { __type: T };
export type SlabID = number & { __type: 'slab' };
export class Store {
	#props = new Map<number, any>();
	#cur_prop = 0;
	#slabs = new Map<number, { props: number[]; effects: number[] }>();
	#cur_slab = 0;
	#is_updating = false;
	#dirty_props: Set<number> = new Set();
	#track_result: { read: Set<number>; write: Set<number> } | null = null;

	new_slab(): SlabID {
		let id = this.#cur_slab;
		this.#slabs.set(id, { props: [], effects: [] });
		this.#cur_slab += 1;
		return id as SlabID;
	}
	has_slab(id: SlabID): boolean {
		return this.#slabs.has(id);
	}
	remove_slab(id: SlabID) {
		let slab = this.#slabs.get(id);
		if (!slab) throw new Error(`Slab ${id} does not exist`);
		for (let prop of slab.props) this.#props.delete(prop);
		this.#slabs.delete(id);
	}

	prop<T>(value: T, slab = 0 as SlabID): PropId<T> {
		let id = this.#cur_prop;
		this.#props.set(id, value);
		this.#cur_prop += 1;
		if (slab != 0) this.#slabs.get(slab)?.props.push(id);
		return id as PropId<T>;
	}

	get<T>(id: PropId<T>): T {
		this.#track_read(id);
		return this.#props.get(id) as T;
	}
	peek<T>(id: PropId<T>): T {
		return this.#props.get(id) as T;
	}
	set<T>(id: PropId<T>, value: T) {
		this.#track_write(id);
		this.#props.set(id, value);
	}
	update<T>(id: PropId<T>, updater: (value: T) => T) {
		this.#track_write(id);
		this.#props.set(id, updater(this.#props.get(id) as T));
	}

	get tracking(): boolean {
		return this.#track_result != null;
	}
	start_track() {
		if (this.#track_result != null) throw new Error('already tracking');
		this.#track_result = { read: new Set(), write: new Set() };
	}
	end_track(): { read: number[]; write: number[] } {
		if (this.#track_result == null) throw new Error('not tracking');
		let result = this.#track_result;
		this.#track_result = null;
		return { read: Array.from(result.read), write: Array.from(result.write) };
	}
	#track_read(id: number) {
		if (this.#track_result == null) return;
		this.#track_result.read.add(id);
	}
	#track_write(id: number) {
		if (this.#track_result == null) return;
		this.#track_result.write.add(id);
	}

	#mark_dirty(id: number) {
		if (this.#is_updating) return;
		this.#dirty_props.add(id);
	}
}
