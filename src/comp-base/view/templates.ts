import { LiteNode } from "../../litedom/core.ts";
import type { Action } from "../action/actions.ts";
import { onAddTemplate } from "../core/globalEvents.ts";
import { throw_adding_existing_template, throw_getting_undefined_template } from "./errors.ts";

export interface Template {
	node: LiteNode;
	actions: Action[];
}

const registry = new Map<string, Template>;
registry.set('empty', { node: new LiteNode('div', {}, [], { 'neocomp:id': 0 }), actions: [] });

export function add (name: string, template: Template) {
	if (registry.has(name)) throw_adding_existing_template(name);
	onAddTemplate.trigger(name, template);
	registry.set(name, template);
}
export function get (name: string) {
	if (!registry.has(name)) throw_getting_undefined_template(name);
	return registry.get(name) as Template
}
export function has (name: string) {
	return registry.has(name);
}

export function infoDump (type: 'templates') {
	if (type === 'templates') return Object.fromEntries(registry);
}

export const templates = { add, get, has }