import type { ChunkBuild, RemovableChunk } from './chunk.ts';
import type { Context } from './index.ts';
import type { ReadSignal, Signal } from './reactive.ts';

export function render_list<T, K>(
	prop: ReadSignal<T[]>,
	key_fn: ((item: T) => K) | null,
	tag: string,
	item_chunk: (build: ChunkBuild, item: T) => void,
) {
	return (build: ChunkBuild) =>
		render_list_core(build, prop, key_fn, false, tag, (build, item, _) =>
			item_chunk(build, item),
		);
}

export function render_list_enumerated<T, K>(
	prop: ReadSignal<T[]>,
	key_fn: ((item: T) => K) | null,
	tag: string,
	item_chunk: (build: ChunkBuild, item: T, index: Signal<number>) => void,
) {
	return (build: ChunkBuild) =>
		render_list_core(build, prop, key_fn, true, tag, (build, item, index) =>
			item_chunk(build, item, index!),
		);
}

function render_list_core<T, K>(
	build: ChunkBuild,
	prop: ReadSignal<T[]>,
	_key_fn: ((item: T) => K) | null,
	enumerate: boolean,
	tag: string,
	item_chunk: (build: ChunkBuild, item: T, index: Signal<number> | null) => void,
): void {
	let key_fn = _key_fn ?? ((item: T) => item as any as K);
	let list = prop.value;

	let items: (Item | null)[] = new Array(list.length).fill(null);
	let keys: K[] = new Array(list.length);

	for (let [ind, item_value] of list.entries()) {
		keys[ind] = key_fn(item_value);

		let item = build_item(build.ctx, tag, item_value, enumerate ? ind : null, item_chunk);
		build.cur_el.append(item.build.base_el);

		items[ind] = item;
	}

	let parent = build.cur_el;
	let patcher = () => {
		let list = prop.value;
		let new_keys = list.map(key_fn);
		let new_items: (Item | null)[] = new Array(list.length).fill(null);

		let patcher = new Patcher(parent, items, new_items, (ind) => {
			return build_item(build.ctx, tag, list[ind], enumerate ? ind : null, item_chunk);
		});

		diff(keys, new_keys, patcher);

		items = new_items;
		keys = new_keys;
	};

	build.store.effect_manual([prop.id], [], patcher, build.slab, false);

	if (build.slab !== undefined)
		build.store.add_cleaner(build.slab, () => {
			for (let item of items) item?.build.remove();
		});
}

interface Item {
	build: RemovableChunk;
	index?: Signal<number>;
}

function build_item<T>(
	ctx: Context,
	tag: string,
	item: T,
	ind: number | null,
	item_chunk: (build: ChunkBuild, item: T, index: Signal<number> | null) => void,
): Item {
	let build = ctx.removable_chunk(tag);
	let index = ind !== null ? build.signal(ind) : undefined;
	item_chunk(build, item, index ?? null);
	return { index, build };
}

export interface ReconcileOps {
	insert(new_ind: number, reference: number | null): void;
	move(new_ind: number, reference: number | null): void;
	remove(old_ind: number): void;
	set_index(old_ind: number, new_ind: number): void;
}

class Patcher implements ReconcileOps {
	parent: Element;
	old_items: (Item | null)[];
	new_items: (Item | null)[];
	item_builder: (ind: number) => Item;

	constructor(
		parent: Element,
		old_items: (Item | null)[],
		new_items: (Item | null)[],
		item_builder: (ind: number) => Item,
	) {
		this.parent = parent;
		this.old_items = old_items;
		this.new_items = new_items;
		this.item_builder = item_builder;
	}

	insert(new_ind: number, reference: number | null): void {
		let item = this.item_builder(new_ind);

		if (reference !== null) {
			this.new_items[reference]!.build.base_el.before(item.build.base_el);
		} else this.parent.append(item.build.base_el);

		this.new_items[new_ind] = item;
	}

	move(new_ind: number, reference: number | null): void {
		let el = this.new_items[new_ind]!.build.base_el;
		if (reference !== null) {
			this.new_items[reference]!.build.base_el.before(el);
		} else this.parent.append(el);
	}

	remove(old_ind: number): void {
		this.old_items[old_ind]!.build.remove();
	}

	set_index(old_ind: number, new_ind: number): void {
		let item = this.old_items[old_ind]!;
		if (item.index !== undefined && old_ind !== new_ind) {
			item.index.value = new_ind;
			item.index.store.force_update(item.index.id);
		}
		this.new_items[new_ind] = item;
	}
}

/**
 * Computes the diff between two lists and applies operations.
 */
export function diff<K>(old_keys: K[], new_keys: K[], ops: ReconcileOps): void {
	const old_len = old_keys.length;
	const new_len = new_keys.length;

	// 1. Common Prefix: Skip matching items at the start.
	let start = 0;
	while (start < old_len && start < new_len && old_keys[start] === new_keys[start]) {
		ops.set_index(start, start);
		start++;
	}

	// 2. Common Suffix: Skip matching items at the end.
	let old_end = old_len;
	let new_end = new_len;
	while (old_end > start && new_end > start && old_keys[old_end - 1] === new_keys[new_end - 1]) {
		old_end--;
		new_end--;
		ops.set_index(old_end, new_end);
	}

	// 3. Fast Paths: If we only have insertions or removals left.
	if (start === old_end) {
		// Only insertions remain.
		for (let ind = start; ind < new_end; ind++) {
			const ref_ind = new_end < new_len ? new_end : null;
			ops.insert(ind, ref_ind);
		}
	} else if (start === new_end) {
		// Only removals remain.
		for (let ind = start; ind < old_end; ind++) {
			ops.remove(ind);
		}
	} else {
		// 4. Map Phase: Build a map of the remaining new items.
		const new_left = new_end - start;
		const new_ind_map = new Map<K, number>();
		const next_duplicate = new Array<number | null>(new_left).fill(null);

		for (let ind = new_end - 1; ind >= start; ind--) {
			const key = new_keys[ind];
			if (new_ind_map.has(key)) {
				next_duplicate[ind - start] = new_ind_map.get(key)!;
			}
			new_ind_map.set(key, ind);
		}

		// Tracks where new items came from. `0` means it's a brand new item.
		const sources = new Int32Array(new_left);
		let some_moved = false;
		let pos = 0;
		let items_patched = 0;

		// Find which old items are kept, moved, or removed.
		for (let ind = start; ind < old_end; ind++) {
			if (items_patched >= new_left) {
				ops.remove(ind);
				continue;
			}

			const key = old_keys[ind];
			if (new_ind_map.has(key)) {
				const new_ind = new_ind_map.get(key)!;
				new_ind_map.delete(key);

				const source_ind = new_ind - start;

				const next_ind = next_duplicate[source_ind];
				if (next_ind !== null) {
					new_ind_map.set(new_keys[next_ind], next_ind);
				}

				// Item is kept. Record its old index (+1 to reserve 0 for "new").
				sources[source_ind] = ind + 1;
				ops.set_index(ind, new_ind);

				// If a new index is smaller than a previous one, items crossed paths (moved).
				if (new_ind >= pos) pos = new_ind;
				else some_moved = true;

				items_patched++;
				continue;
			}

			// Item doesn't exist in the new array
			ops.remove(ind);
		}

		// 5. Patch Phase: Apply DOM mutations backwards.
		if (some_moved) {
			// Find the longest sequence of items that don't need to move.
			const seq = longest_increasing_subsequence(sources);
			let j = seq.length - 1;

			// in reverse to make `reference` always in its final position
			for (let ind = new_left - 1; ind >= 0; ind--) {
				const new_ind = start + ind;
				const ref_ind = new_ind + 1 < new_len ? new_ind + 1 : null;

				// Brand new item.
				if (sources[ind] === 0) ops.insert(new_ind, ref_ind);
				// Item exists, but isn't an anchor. MOVE it.
				else if (j < 0 || ind !== seq[j]) ops.move(new_ind, ref_ind);
				// Item is an anchor. Leave it exactly where it is.
				else j--;
			}
		} else {
			// Optimization: Nothing moved, just insert the new items in the gaps.
			for (let ind = new_left - 1; ind >= 0; ind--) {
				if (sources[ind] === 0) {
					const new_ind = start + ind;
					const ref_ind = new_ind + 1 < new_len ? new_ind + 1 : null;
					ops.insert(new_ind, ref_ind);
				}
			}
		}
	}
}

/**
 * Calculates the Longest Increasing Subsequence in O(N log N) using Patience Sorting.
 * Returns the indices of the elements that form the sequence.
 */
function longest_increasing_subsequence(a: Int32Array): number[] {
	const pred = new Int32Array(a.length); // Predecessor tracking for backtracking
	const result: number[] = []; // Stores indices of the smallest tails seen so far

	for (let ind = 0; ind < a.length; ind++) {
		if (a[ind] === 0) continue; // Ignore completely new nodes

		const j = result.length;
		if (j === 0 || a[result[j - 1]] < a[ind]) {
			// Found a larger item. Extend the subsequence.
			if (j > 0) pred[ind] = result[j - 1];
			result.push(ind);
			continue;
		}

		// Binary search to find partition point
		let left = 0;
		let right = result.length;
		while (left < right) {
			const mid = (left + right) >> 1;
			if (a[result[mid]] < a[ind]) left = mid + 1;
			else right = mid;
		}
		const pos = left;

		if (pos > 0) pred[ind] = result[pos - 1];

		result[pos] = ind;
	}

	// Backtrack through predecessors to build the exact anchor sequence
	let u = result.length;
	const seq = new Array<number>(u);
	let v = u > 0 ? result[u - 1] : 0;

	while (u > 0) {
		u--;
		seq[u] = v;
		v = pred[v];
	}

	return seq;
}
