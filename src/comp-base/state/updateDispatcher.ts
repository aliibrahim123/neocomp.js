// dispatch updates without overupdate
// every effect is granduated to be called once
// support conditionally updating properties during an update

import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { Linkable } from "../core/linkable.ts";
import { throw_circular_dep_update } from "./errors.ts";
import { Store } from "./store.ts";

/** a unit encapsulating an effect */
export interface EffectUnit {
	/** properties it effect */
	effect: number[],
	/** properties effecting it directly */
	effectedBy: number[],
	/** the handler */
	handler: () => void,
	/** bindings the effect is bound to */
	bindings: any[],
	/** user defined metadata */
	meta: object
}

/** unit responsible for dispatching updates */
export class UpdateDispatcher {
	/** effect units by effecting properties */
	#records = new Map<number, EffectUnit[]>();
	/** effect units by bindings */
	#bindings = new Map<any, EffectUnit[]>();
	constructor (store: Store) {
		store.onChange.listen((_, props) => this.update(props.map(prop => prop.id)));
		store.base.onUnlink.listen((_, linked) => this.remove([linked]));
		store.onRemove.listen((_, prop) => this.remove([prop.id]));
	}

	/** add an effect */
	add (
		effectedBy: number[], effect: number[], handler: (this: EffectUnit) => void,
		bindings: any[] = [], meta: object = {}
	) {
		const unit: EffectUnit = { effectedBy, effect, handler, bindings, meta };
		// add to all effectedBy properties
		for (const prop of effectedBy)
			if (this.#records.has(prop)) this.#records.get(prop)?.push(unit);
			else this.#records.set(prop, [unit]);
		for (const binding of bindings)
			if (this.#bindings.has(binding)) this.#bindings.get(binding)?.push(unit);
			else this.#bindings.set(binding, [unit]);
		return unit
	}

	isUpdating = false;
	#currentUnits: EffectUnit[] = [];
	#curUnitsInd = 0;
	#unitsInvolved = new Set<EffectUnit>;
	#propsInvolved = new Set<number>();
	/** trigger an update */
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

	/** remove a effect */
	remove (fn: (unit: EffectUnit) => boolean, props?: number[]): void;
	remove (props: number[]): void;
	remove (binding: any[]): void;
	remove (toRemove: ((unit: EffectUnit) => boolean) | any, props?: number[]) {
		const filter = (prop: number, fn: (unit: EffectUnit) => boolean) => {
			let units = this.#records.get(prop);
			if (!units) return;
			units = units?.filter(unit => !fn(unit));

			if (units.length === 0) this.#records.delete(prop);
			else this.#records.set(prop, units);
		}

		if (typeof (toRemove) === 'function') {
			if (props) for (const prop of props) filter(prop, toRemove);
			else for (const [prop, _] of this.#records) filter(prop, toRemove);
		}

		else {
			let involvedProps = new Set<number>();
			let involvedUnits = new Set<EffectUnit>();
			// collect units
			// case props
			if (typeof (toRemove[0]) === 'number') {
				involvedProps = new Set(toRemove);
				for (const prop of toRemove) for (const unit of this.#records.get(prop) || []) {
					for (const prop of unit.effectedBy) involvedProps.add(prop);
					involvedUnits.add(unit);
				}
			}
			// case bindings
			else for (const binding of toRemove) {
				let units = this.#bindings.get(binding);
				if (!units) continue;
				for (const unit of units) {
					for (const prop of unit.effectedBy) involvedProps.add(prop);
					involvedUnits.add(unit);
				}
				this.#bindings.delete(binding);
			}
			// remove units
			for (const prop of involvedProps) filter(prop, unit => involvedUnits.has(unit));
		}
	}

	/** dump information */
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
