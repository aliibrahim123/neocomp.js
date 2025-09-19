// simple typed event unit

import type { fn } from './types.ts';

export class Event <Listener extends fn> {
	#listeners: fn[] = [];
	
	listen (listener: Listener) {
		this.#listeners.push(listener);
	}
	unlisten (listener: Listener) {
		this.#listeners = this.#listeners.filter(fn => fn !== listener)
	}

	trigger (...args: Parameters<Listener>) {
		for (const listener of this.#listeners) listener(...args);
	}

	once (listener: Listener) {
		const fn = (...args: any[]) => {
			listener(...args);
			this.unlisten(fn as Listener);
		}
		this.#listeners.push(fn as Listener);;
	}
	
	async awaitForIt (): Promise<Parameters<Listener>> {
		return new Promise(res => 
			this.once(((...args) => res(args as any)) as Listener)
		)
	}
}

// one time init event
export class OTIEvent <Listener extends fn> extends Event<Listener> {
	#listeners: fn[] = [];
	#inited: boolean = false;
	#args: Parameters<Listener> = undefined as any; 
	
	override listen (listener: Listener) {
		if (this.#inited) listener(...this.#args);
		else this.#listeners.push(listener);
	}
	override unlisten (listener: Listener) {
		this.#listeners = this.#listeners.filter(fn => fn !== listener)
	}

	override trigger (...args: Parameters<Listener>) {
		if (this.#inited) throw new TypeError('OTIEvent: event already triggered');
		for (const listener of this.#listeners) listener(...args);
		this.#inited = true;
		this.#args = args;
		this.#listeners = [];
	}

	override once (listener: Listener) {
		this.listen(listener);;
	}

	override async awaitForIt (): Promise<Parameters<Listener>> {
		return new Promise(res => 
			this.listen(((...args: any[]) => res(args as any)) as Listener)
		)
	}
}

export type ListenerOf <event extends Event<fn>> = 
	event extends Event<infer listener> ? listener : never;

export function listenUntil <listener extends fn>
  (source: Event<fn>, target: Event<listener>, listener: listener) {
	target.listen(listener);
	source.once(() => target.unlisten(listener));
}