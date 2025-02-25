//simple typed event unit

import type { fn } from './types.ts';

export class Event <Listener extends fn> {
	#listeners: Listener[] = [];
	
	on (listener: Listener) {
		this.#listeners.push(listener);
		return this
	}
	off (listener: Listener) {
		this.#listeners = this.#listeners.filter(fn => fn !== listener)
		return this
	}

	trigger (...args: Parameters<Listener>) {
		for (const listener of this.#listeners) listener(...args);
		return this
	}

	once (listener: Listener) {
		const fn = (...args: any[]) => {
			listener(...args);
			this.off(fn as Listener);
		}
		this.#listeners.push(fn as Listener);
		return this;
	}
	
	async awaitForIt (): Promise<Parameters<Listener>> {
		return new Promise(res => 
			this.once(((...args: any[]) => res(args as any)) as Listener)
		)
	}
}

//one time init event
export class OTIEvent <Listener extends fn> {
	#listeners: Listener[] = [];
	#inited: boolean = false;
	#args: Parameters<Listener> = undefined as any; 
	
	on (listener: Listener) {
		if (this.#inited) listener(...this.#args);
		else this.#listeners.push(listener);
		return this
	}
	off (listener: Listener) {
		this.#listeners = this.#listeners.filter(fn => fn !== listener)
		return this
	}

	trigger (...args: Parameters<Listener>) {
		for (const listener of this.#listeners) listener(...args);
		this.#inited = true;
		this.#args = args;
		this.#listeners = [];
		return this
	}

	once (listener: Listener) {
		this.on(listener);
		return this;
	}

	async awaitForIt (): Promise<Parameters<Listener>> {
		return new Promise(res => 
			this.on(((...args: any[]) => res(args as any)) as Listener)
		)
	}
}