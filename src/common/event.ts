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
		function fn (...args) {
			listener(...args);
			this.off(fn);
		}
		this.#listeners.push(fn as Listener);
		return this;
	}
}