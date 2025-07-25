//dispatch updates without overcall

//all props are not static

import { throw_undefined_info_dump_type } from "../core/errors.ts";
import type { Linkable } from "../core/linkable.ts";
import { throw_circular_dep_update } from "./errors.ts";
import { Store } from "./store.ts";

export interface UDispatcherOptions {
	balance: boolean;
}

export interface EffectUnit {
	effect: symbol[],
	effectedBy: symbol[],
	handler: () => void,
	from: Linkable | undefined,
	meta: object
}

export class UpdateDispatcher {
	#base: Linkable;
	#store: Store<any>;
	#records = new Map<symbol, EffectUnit[]>();
	constructor (store: Store<any>, options: Partial<UDispatcherOptions> = {}) {
		this.options = { 
			...(this.constructor as typeof UpdateDispatcher).defaults, ...options
		};

		this.#store = store;
		this.#base = store.base;
		store.onChange.listen((_, props) => this.update(props.map(prop => prop.symbol)));
		this.#base.onUnlink.listen((_, linked) => this.remove(unit => unit.from === linked));
		store.onRemove.listen((_, prop) => this.remove(unit => unit.effectedBy.includes(prop.symbol)));
	}
	options: UDispatcherOptions;
	static defaults: UDispatcherOptions = {
		balance: true
	}

	add (
		effectedBy: symbol[], effect: symbol[], handler: (this: EffectUnit) => void,
		from?: Linkable, meta: object = {}
	) {
		const unit: EffectUnit = { effectedBy, effect, handler, from, meta };
		for (const prop of effectedBy) 
			if (this.#records.has(prop)) this.#records.get(prop)?.push(unit);
			else this.#records.set(prop, [unit]);
	}

	update (props: symbol[]) {
		if (!this.options.balance) {
			for (const prop of props) {
				const units = this.#records.get(prop);
				if (units) for (const unit of units) unit.handler();
			}
			return;
		}
		//add props to queue
		for (const prop of props) {
			if (!this.#records.has(prop)) continue;
			this.#addProp(prop, true);
		}

		//if not dispatching, start it
		if (this.isDispatching) return;
		this.isDispatching = true;
		this.#dispatch();
	}

	isDispatching = false;
	#currentUnits: EffectUnit[] = [];
	#nextUnits: EffectUnit[] = [];
	#unitsInvolved = new Set<EffectUnit>;
	#propsInvolved = new Set<symbol>();
	#dependencies = new Map<symbol, number>();
	#addProp (prop: symbol, force = false) {
		//skip if already added
		if (this.#propsInvolved.has(prop) && !force) return;
		this.#propsInvolved.add(prop);
		const units = this.#records.get(prop);
		//skip if not units
		if (!units) return;
		for (const unit of units) {
			//skip if in queue
			if (this.#unitsInvolved.has(unit)) continue;
			this.#unitsInvolved.add(unit);
			this.#currentUnits.push(unit);
			//add effected props
			for (const prop of unit.effect) {
				this.#dependencies.set(prop, (this.#dependencies.get(prop) || 0) + 1);
				this.#addProp(prop);
			}
		}	
	}
	#dispatch () {
		let anyCalled = false;
		//while there are in queue
		while (this.#currentUnits.length !== 0) {
			for (let ind = 0; ind < this.#currentUnits.length; ind++) {
				const curUnit = this.#currentUnits[ind];
				//if not all dependencies are up to date, someone will update them
				if (curUnit.effectedBy.some(prop => {
					const count = this.#dependencies.get(prop);
					return count !== undefined && count > 0
				})) {
					//add to the next patch
					this.#nextUnits.push(curUnit);
					continue;
				}
				//else can be called safely
				curUnit.handler();
				this.#unitsInvolved.delete(curUnit);
				//dec its effected props dependencies count 
				for (const prop of curUnit.effect) 
					this.#dependencies.set(prop, this.#dependencies.get(prop) as number - 1);
				anyCalled = true;
			}
			
			//stop if there are circular dependency
			if (!anyCalled) throw_circular_dep_update();
			anyCalled = false
			//swap with next batch
			this.#currentUnits = this.#nextUnits;
			this.#nextUnits = [];
		}
		
		//finished, reset to normal
		this.isDispatching = false;
		this.#propsInvolved = new Set;
		this.#dependencies = new Map();
	}

	remove (fn: (unit: EffectUnit) => boolean, props?: symbol[]) {
		if (props) for (const prop of props) {
			const units = this.#records.get(prop);
			if (units) this.#records.set(prop, units.filter(unit => !fn(unit)));
		}
		else for (const [prop, units] of this.#records)
			this.#records.set(prop, units.filter(unit => !fn(unit)));
	}

	infoDump (type: 'records'): Record<string, EffectUnit[]>;
	infoDump (type: 'records') {
		if (type === 'records') {
			const records: Record<string, EffectUnit[]> = {};
			for (const [prop, units] of this.#records) 
				records[this.#store.getProp(prop).name] = units;
			return records
		}
		throw_undefined_info_dump_type(type);
	}
}
