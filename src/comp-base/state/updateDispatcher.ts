// dispatch updates without overupdate
// every effect is granduated to be called once
// support conditionally updating properties during an update

import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { Linkable } from "../core/linkable.ts";
import { throw_circular_dep_update } from "./errors.ts";
import { Store } from "./store.ts";

export interface UDispatcherOptions {
	balance: boolean;
}

export interface EffectUnit {
	effect: number[],
	effectedBy: number[],
	handler: () => void,
	from: Linkable | undefined,
	meta: object
}

export class UpdateDispatcher {
	#base: Linkable;
	#records = new Map<number, EffectUnit[]>();
	constructor (store: Store) {
		this.#base = store.base;
		store.onChange.listen((_, props) => this.update(props.map(prop => prop.id)));
		this.#base.onUnlink.listen((_, linked) => this.remove(unit => unit.from === linked));
		store.onRemove.listen((_, prop) => this.remove(unit => unit.effectedBy.includes(prop.id)));
	}

	add (
		effectedBy: number[], effect: number[], handler: (this: EffectUnit) => void,
		from?: Linkable, meta: object = {}
	) {
		const unit: EffectUnit = { effectedBy, effect, handler, from, meta };
		// add to all effectedBy properties
		for (const prop of effectedBy)
			if (this.#records.has(prop)) this.#records.get(prop)?.push(unit);
			else this.#records.set(prop, [unit]);
	}

	isUpdating = false;
	#currentUnits: EffectUnit[] = [];
	#curUnitsInd = 0;
	#unitsInvolved = new Set<EffectUnit>;
	#propsInvolved = new Set<number>();
	update (props: number[]) {
		// gather units
		props = props.filter(prop => !this.#propsInvolved.has(prop));
		const units = this.#gatherUnits(props);

		// if in update, add dirty units to the current list
		if (this.isUpdating) {
			this.#currentUnits = units.concat(this.#currentUnits.slice(this.#curUnitsInd));
			this.#curUnitsInd = 0;
			return;
		}

		// trigger units
		this.#currentUnits = units;
		this.isUpdating = true;

		// not a direct for loop since some units might be added while updating
		while (this.#curUnitsInd < this.#currentUnits.length) {
			let unit = this.#currentUnits[this.#curUnitsInd];
			this.#curUnitsInd++;
			this.#unitsInvolved.delete(unit);
			unit.handler.call(unit);
		}

		// reset to normal
		this.isUpdating = false;
		this.#currentUnits = [];
		this.#curUnitsInd = 0;
		this.#propsInvolved.clear();
	}
	#gatherUnits (props: number[]) {
		// sort the units topologically
		const sorted: EffectUnit[] = [];
		// parents of the currently visited unit, not all visited
		const visiting: EffectUnit[] = [];

		const visit = (unit: EffectUnit) => {
			// ensure not visited before
			if (visiting.includes(unit)) throw_circular_dep_update();
			if (this.#unitsInvolved.has(unit)) return;

			visiting.push(unit);

			// visit effected units
			for (const prop of unit.effect) {
				this.#propsInvolved.add(prop);
				const units = this.#records.get(prop);
				if (units) for (const unit of units) visit(unit);
			}

			// add
			visiting.pop();
			this.#unitsInvolved.add(unit);
			sorted.push(unit);
		}

		// visit every unit of all props
		for (const prop of props) {
			this.#propsInvolved.add(prop);

			const units = this.#records.get(prop);
			if (units) for (const unit of units) visit(unit);
		}

		// before, all child then their parents
		return sorted.reverse();
	}

	remove (unit: EffectUnit): void;
	remove (fn: (unit: EffectUnit) => boolean, props?: number[]): void;
	remove (toRemove: ((unit: EffectUnit) => boolean) | EffectUnit, props?: number[]) {
		if (typeof (toRemove) === 'function') {
			if (props) for (const prop of props) {
				const units = this.#records.get(prop);
				if (units) this.#records.set(prop, units.filter(unit => !toRemove(unit)));
			}
			else for (const [prop, units] of this.#records)
				this.#records.set(prop, units.filter(unit => !toRemove(unit)));
		}
		else for (const prop of toRemove.effectedBy) {
			this.#records.set(prop, this.#records.get(prop)?.filter(unit => unit !== toRemove) as any);
		}
	}

	infoDump (type: 'records'): Record<number, EffectUnit[]>;
	infoDump (type: 'records') {
		if (type === 'records') {
			const records: Record<number, EffectUnit[]> = {};
			for (const [prop, units] of this.#records)
				records[prop] = units;
			return records
		}
		throw_undefined_info_dump_type(type);
	}
}
