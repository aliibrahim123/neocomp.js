export type PropId<T> = number & { __type: T };
export type SlabID = number & { __type: 'slab' };
export class Store {
	#props = new Map<number, any>();
	#cur_prop = 0;
	#slabs = new Map<number, { props: number[]; effects: number[] }>();
	#slabs_to_remove: SlabID[] = [];
	#cur_slab = 0;
	#is_updating = false;
	#dirty_props: Set<number> = new Set();
	#effects = new Map<number, { fun: () => void; read: number[]; write: number[] }>();
	#cur_effect = 0;
	#read_effect_map = new Map<number, number[]>();
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
		if (!this.#slabs.has(id)) throw new Error(`slab ${id} does not exist`);
		if (this.#is_updating) this.#slabs_to_remove.push(id);
		else this.#remove_slab(id);
	}
	#remove_slab(id: SlabID) {
		let slab = this.#slabs.get(id)!;
		for (let prop of slab.props) this.#props.delete(prop);
		for (let effect of slab.effects) {
			for (let read of this.#effects.get(effect)!.read) {
				let ind = this.#read_effect_map.get(read)!.indexOf(effect);
				this.#read_effect_map.get(read)?.splice(ind, 1);
			}
			this.#effects.delete(effect);
		}
		this.#slabs.delete(id);
	}

	prop<T>(value: T, slab: SlabID | undefined = undefined): PropId<T> {
		let id = this.#cur_prop;
		this.#props.set(id, value);
		this.#cur_prop += 1;
		if (slab != undefined) this.#slabs.get(slab)?.props.push(id);
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
		this.#mark_dirty(id);
		this.#props.set(id, value);
	}
	update<T>(id: PropId<T>, updater: (value: T) => T) {
		this.#track_write(id);
		this.#mark_dirty(id);
		this.#props.set(id, updater(this.#props.get(id) as T));
	}

	signal<T>(value: T, slab: SlabID | undefined = undefined): Signal<T> {
		return new Signal(this, this.prop(value, slab));
	}
	singal_for<T>(id: PropId<T>): Signal<T> {
		return new Signal(this, id);
	}

	effect(fun: () => void, slab: SlabID | undefined = undefined) {
		this.start_track();
		fun();
		let { read, write } = this.end_track();
		this.#add_effect(fun, read, write, slab);
	}
	effect_manual(
		fun: () => void,
		read: number[],
		write: number[],
		slab: SlabID | undefined = undefined,
		init_run = true,
	) {
		if (init_run) fun();
		this.#add_effect(fun, read, write, slab);
	}
	#add_effect(
		fun: () => void,
		read: number[],
		write: number[],
		slab: SlabID | undefined = undefined,
	) {
		let id = this.#cur_effect;
		this.#effects.set(id, { fun, read, write });
		this.#cur_effect += 1;
		if (slab != undefined) this.#slabs.get(slab)?.effects.push(id);
		for (let prop of read) {
			if (!this.#read_effect_map.has(prop)) this.#read_effect_map.set(prop, [id]);
			else this.#read_effect_map.get(prop)?.push(id);
		}
		return id;
	}
	computed<T>(fun: () => T, slab: SlabID | undefined = undefined): ROSignal<T> {
		this.start_track();
		let value = fun();
		let { read, write } = this.end_track();
		if (write.length != 0) throw new Error('computed properties cannot set other properties');
		let prop = this.prop(value, slab);
		this.#add_effect(() => this.set(prop, fun()), read, [prop], slab);
		return new ROSignal(this, prop);
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

	get updating(): boolean {
		return this.#is_updating;
	}
	#mark_dirty(id: number) {
		if (this.#is_updating) return;
		this.#dirty_props.add(id);
	}
	force_update(id: PropId<any>) {
		this.#dirty_props.add(id);
	}
	flush_updates() {
		if (this.#is_updating) return;

		this.#is_updating = true;
		while (this.#dirty_props.size > 0) {
			let to_run: number[] = [], visited = new Set<number>(), visiting: number[] = [];
			for (let prop of this.#dirty_props) {
				visit(this, prop, to_run, visited, visiting);
			}
			this.#dirty_props.clear();
			for (let i = to_run.length - 1; i >= 0; i -= 1) {
				this.#effects.get(to_run[i])!.fun();
			}
		}
		this.#is_updating = false;

		for (let slab of this.#slabs_to_remove) {
			if (this.#slabs.has(slab)) this.#remove_slab(slab);
		}
		this.#slabs_to_remove = [];

		function visit(
			store: Store,
			prop: number,
			to_run: number[],
			visited: Set<number>,
			visiting: number[],
		) {
			let effects = store.#read_effect_map.get(prop);
			if (effects == undefined) return;
			for (let effect of effects) {
				if (visiting.includes(effect)) {
					throw new Error('detected circular dependency in an update');
				}
				if (visited.has(effect)) continue;
				visiting.push(effect);
				for (let prop of store.#effects.get(effect)!.write) {
					visit(store, prop, to_run, visited, visiting);
				}
				visiting.pop();
				to_run.push(effect);
				visited.add(effect);
			}
		}
	}
}

class SignalBase<T> {
	#prop: PropId<T>;
	#store: Store;
	constructor(store: Store, prop: PropId<T>) {
		this.#prop = prop;
		this.#store = store;
	}
	get prop(): PropId<T> {
		return this.#prop;
	}
	get store(): Store {
		return this.#store;
	}
}

export class Signal<T> extends SignalBase<T> {
	get value(): T {
		return this.store.get(this.prop);
	}
	set value(value: T) {
		this.store.set(this.prop, value);
	}
	peek(): T {
		return this.store.peek(this.prop);
	}
	update(updater: (value: T) => T) {
		this.store.update(this.prop, updater);
	}
	as_ro(): ROSignal<T> {
		return new ROSignal(this.store, this.prop);
	}
}
export class ROSignal<T> extends SignalBase<T> {
	get value(): T {
		return this.store.get(this.prop);
	}
	peek(): T {
		return this.store.peek(this.prop);
	}
}
