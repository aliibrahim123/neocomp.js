import type { Context } from './index.ts';

/** a type aware id of a reactive property */
export type PropId<T> = number & { __type: T };
/** an id of a {@linkcode Store} slab */
export type SlabID = number & { __type: 'slab' };

/** the container of the reactive system.
 *
 * the `Store` is the type that manages the reactive system of a {@linkcode Context}.
 *
 * it provides low level access to the reactive system.
 *
 * a `Store` has multiple scopes that contains their own items (properties and effects) that get removed with its removal, they are the global scope and the slab scopes.
 *
 * the `Store` provide a tracking mechanism that allows to determine which properties are used in a peice of code.
 * @hideconstructor
 */
export class Store {
	#props = new Map<number, any>();
	#next_prop_id = 0;
	#slabs = new Map<number, { props: number[]; effects: number[]; cleaners: (() => void)[] }>();
	#slabs_to_remove: SlabID[] = [];
	#next_slab_id = 0;
	#is_updating = false;
	#dirty_props: Set<number> = new Set();
	#effects = new Map<number, { fun: () => void; read: number[]; write: number[] }>();
	#next_effect_id = 0;
	// read deps -> effect id
	#read_effect_map = new Map<number, number[]>();
	#track_result: { read: Set<number>; write: Set<number> } | null = null;

	/** create a new slab, returning its {@linkcode SlabID} */
	new_slab(): SlabID {
		let id = this.#next_slab_id;
		this.#slabs.set(id, { props: [], effects: [], cleaners: [] });
		this.#next_slab_id += 1;
		return id as SlabID;
	}
	/** whether the slab exists */
	has_slab(id: SlabID): boolean {
		return this.#slabs.has(id) && !this.#slabs_to_remove.includes(id);
	}
	/** remove the slab.
	 *
	 * if the `Store` is under update, the slab will be removed when the update is finished.
	 */
	remove_slab(id: SlabID) {
		if (!this.#slabs.has(id)) throw new Error(`slab ${id} does not exist`);
		if (this.#is_updating) this.#slabs_to_remove.push(id);
		else this.#remove_slab(id);
	}
	/** remove the slab for real */
	#remove_slab(id: SlabID) {
		let slab = this.#slabs.get(id)!;
		for (let cleaner of slab.cleaners) cleaner();
		for (let prop of slab.props) {
			this.#props.delete(prop);
			this.#read_effect_map.delete(prop);
		}
		for (let effect of slab.effects) {
			for (let read of this.#effects.get(effect)!.read) {
				let map = this.#read_effect_map.get(read);
				if (map) {
					map.splice(map.indexOf(effect), 1);
					if (map.length == 0) this.#read_effect_map.delete(read);
				}
			}
			this.#effects.delete(effect);
		}
		this.#slabs.delete(id);
	}
	/** add a cleaner fn to the slab that is called when the slab is removed */
	add_cleaner(slab: SlabID, cleaner: () => void) {
		this.#slabs.get(slab)?.cleaners.push(cleaner);
	}

	/** creates a new reactive property.
	 *
	 * it takes the initial value, and returns the {@linkcode PropId} of the property.
	 *
	 * the property is added to the `slab` scope if provided, else the global scope.
	 */
	prop<T>(value: T, slab: SlabID | undefined = undefined): PropId<T> {
		let id = this.#next_prop_id;
		this.#props.set(id, value);
		this.#next_prop_id += 1;
		if (slab != undefined) this.#slabs.get(slab)?.props.push(id);
		return id as PropId<T>;
	}
	/** whether the property exists */
	has(id: PropId<any>): boolean {
		return this.#props.has(id);
	}

	/** get the value of the property.
	 *
	 * it triggers a read track. */
	get<T>(id: PropId<T>): T {
		this.#track_read(id);
		return this.#props.get(id) as T;
	}
	/** get the value of the property without being track */
	peek<T>(id: PropId<T>): T {
		return this.#props.get(id) as T;
	}
	/** set the value of the property.
	 *
	 * it triggers an update and a write track.
	 */
	set<T>(id: PropId<T>, value: T) {
		this.#track_write(id);
		this.#mark_dirty(id);
		this.#props.set(id, value);
	}
	/** updates a property value using an updater function.
	 *
	 * it triggers an update and a write track.
	 */
	update<T>(id: PropId<T>, updater: (value: T) => T) {
		this.#track_write(id);
		this.#mark_dirty(id);
		this.#props.set(id, updater(this.#props.get(id) as T));
	}

	/** creates a new reactive property and returns its {@linkcode Signal}.
	 *
	 * the property is added to the `slab` scope if provided, else the global scope.
	 */
	signal<T>(value: T, slab: SlabID | undefined = undefined): Signal<T> {
		return new Signal(this, this.prop(value, slab));
	}

	/** returns a {@linkcode Signal} for the given property */
	signal_for<T>(id: PropId<T>): Signal<T> {
		return new Signal(this, id);
	}

	/** creates an effect.
	 *
	 * the effect is runned immediately to determine its dependencies.
	 *
	 * effects are runned once per update batch when needed after all theier dependencies have been updated.
	 *
	 * dependencies are determined one time, if an effect update other properties they will not be updated.
	 *
	 * the effect is added to the `slab` scope if provided, else the global scope.
	 */
	effect(fun: () => void, slab: SlabID | undefined = undefined) {
		this.start_track();
		fun();
		let { read, write } = this.end_track();
		this.#add_effect(fun, read, write, slab);
	}
	/** creates an effect with manual dependencies.
	 *
	 * it takes the list of read and write properties, and run the effect immediately if `init_run` is `true`.
	 *
	 * the effect is added to the `slab` scope if provided, else the global scope.
	 */
	effect_manual(
		read: number[],
		write: number[],
		fun: () => void,
		slab: SlabID | undefined = undefined,
		init_run = true,
	) {
		if (init_run) fun();
		this.#add_effect(fun, read, write, slab);
	}
	/** adds an effect */
	#add_effect(
		fun: () => void,
		read: number[],
		write: number[],
		slab: SlabID | undefined = undefined,
	) {
		let id = this.#next_effect_id;
		this.#effects.set(id, { fun, read, write });
		this.#next_effect_id += 1;

		if (slab != undefined) this.#slabs.get(slab)?.effects.push(id);

		for (let prop of read) {
			if (!this.#read_effect_map.has(prop)) this.#read_effect_map.set(prop, [id]);
			else this.#read_effect_map.get(prop)?.push(id);
		}
		return id;
	}
	/** creates a computed property.
	 *
	 * it takes a function that gets called each time one of its dependencies changes to return the new value.
	 *
	 * the property is added to the `slab` scope if provided, else the global scope.
	 *
	 * it returns a {@linkcode ROSignal} for the property.
	 */
	computed<T>(fun: () => T, slab: SlabID | undefined = undefined): ROSignal<T> {
		this.start_track();
		let value = fun();
		let { read, write } = this.end_track();
		if (write.length != 0) throw new Error('computed properties cannot set other properties');

		let prop = this.prop(value, slab);
		this.#add_effect(() => this.set(prop, fun()), read, [prop], slab);
		return new ROSignal(this, prop);
	}

	/** whether tracking is activated. */
	get tracking(): boolean {
		return this.#track_result != null;
	}
	/** activate tracking. */
	start_track() {
		if (this.#track_result != null) throw new Error('already tracking');
		this.#track_result = { read: new Set(), write: new Set() };
	}
	/** end tracking returning the used properties. */
	end_track(): { read: number[]; write: number[] } {
		if (this.#track_result == null) throw new Error('not tracking');
		let result = this.#track_result;
		this.#track_result = null;
		return { read: Array.from(result.read), write: Array.from(result.write) };
	}
	/** tracks a property as read */
	#track_read(id: number) {
		if (this.#track_result == null) return;
		this.#track_result.read.add(id);
	}
	/** tracks a property as written */
	#track_write(id: number) {
		if (this.#track_result == null) return;
		this.#track_result.write.add(id);
	}

	/** whether the reactive system is updating */
	get updating(): boolean {
		return this.#is_updating;
	}
	/** marks a property as dirty to be updated */
	#mark_dirty(id: number) {
		if (this.#is_updating) return;
		if (this.#dirty_props.size == 0) queueMicrotask(() => this.flush_updates());
		this.#dirty_props.add(id);
	}
	/** force a property to be updated.
	 *
	 * if inside an effect, the property will be updated in the next batch.
	 */
	force_update(id: PropId<any>) {
		this.#dirty_props.add(id);
	}
	/** manually flush updates and run effects
	 *
	 * properties are batched and run in a microtask automatically, however a munual flush can be triggered at any time.
	 *
	 * generally updates come in one batch per flush, however when using {@linkcode force_update}, the force properties will be updated in a next batch.
	 */
	flush_updates() {
		if (this.#is_updating) return;

		this.#is_updating = true;
		// may there be multiple batches
		while (this.#dirty_props.size > 0) {
			// collect
			let to_run: number[] = [],
				visited = new Set<number>(),
				visiting: number[] = [];
			for (let prop of this.#dirty_props) {
				visit(this, prop, to_run, visited, visiting);
			}
			this.#dirty_props.clear();

			// execute without throwing
			// in reverse since the gathering algorithm
			for (let i = to_run.length - 1; i >= 0; i -= 1) {
				try {
					this.#effects.get(to_run[i])!.fun();
				} catch (e) {
					console.error(e);
				}
			}
		}
		this.#is_updating = false;

		// remove slabs removed inside the effects
		for (let slab of this.#slabs_to_remove) {
			if (this.#slabs.has(slab)) this.#remove_slab(slab);
		}
		this.#slabs_to_remove = [];

		/** walk the dependency graph to collect the effects to run */
		function visit(
			store: Store,
			prop: number,
			to_run: number[],
			visited: Set<number>,
			visiting: number[],
		) {
			// visit properties one time and add them after their children.
			// each property come before all its effectors, we need the reverse
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

/** base functionality for signals */
class SignalBase<T> {
	/** the {@linkcode PropId} of the property */
	id: PropId<T>;
	/** the owner {@linkcode Store} */
	store: Store;
	constructor(store: Store, prop: PropId<T>) {
		this.id = prop;
		this.store = store;
	}
}

/** a wrapper around a reactive property @hideconstructor */
export class Signal<T> extends SignalBase<T> implements ReadSignal<T> {
	get value(): T {
		return this.store.get(this.id);
	}
	/** set the value of the property */
	set value(value: T) {
		this.store.set(this.id, value);
	}
	peek(): T {
		return this.store.peek(this.id);
	}
	/** update the property value using an updater function */
	update(updater: (value: T) => T) {
		this.store.update(this.id, updater);
	}
	/** convert the signal to a read-only signal */
	as_ro(): ROSignal<T> {
		return new ROSignal(this.store, this.id);
	}
}
/** a read-only version of {@linkcode Signal} @hideconstructor*/
export class ROSignal<T> extends SignalBase<T> implements ReadSignal<T> {
	get value(): T {
		return this.store.get(this.id);
	}
	peek(): T {
		return this.store.peek(this.id);
	}
}
/** a signal that can be read */
export interface ReadSignal<T> extends SignalBase<T> {
	/** get the value of the property */
	get value(): T;
	/** get the value of the property without being track */
	peek(): T;
}

/** redirects common methods of the {@linkcode Store} @hideconstructor */
export class StoreProv {
	/** the owner {@linkcode Context} */
	ctx: Context = undefined as any;
	/** the scope of the operations, `undefined` for the global scope */
	slab: SlabID | undefined = undefined;
	/** @private */
	init(ctx: Context, slab: SlabID | undefined = undefined) {
		this.ctx = ctx;
		this.slab = slab;
	}
	/** the redirected {@linkcode Store} */
	get store(): Store {
		return this.ctx.store;
	}
	/** create a new reactive property, returning its {@linkcode Signal} */
	signal<T>(value: T): Signal<T> {
		return this.store.signal(value, this.slab);
	}
	/** create an effect */
	effect(fun: () => void) {
		return this.store.effect(fun, this.slab);
	}
	/** create a computed property */
	computed<T>(fun: () => T): ROSignal<T> {
		return this.store.computed(fun, this.slab);
	}
}
