import { LiteNode } from "../../litedom/core.ts";
import type { Action } from "../action/actions.ts";
import { throw_adding_existing_template, throw_getting_undefined_template } from "./errors.ts";

export interface Template {
	node: LiteNode;
	actions: Action[];
}

const templateRegistry = new Map<string, Template>;
templateRegistry.set('empty', { node: new LiteNode('div', {}, [], { 'neocomp:id': 0 }), actions: [] });

export function add (name: string, template: Template) {
	if (templateRegistry.has(name)) throw_adding_existing_template(name);
	templateRegistry.set(name, template);
}
export function get (name: string) {
	if (!templateRegistry.has(name)) throw_getting_undefined_template(name);
	return templateRegistry.get(name) as Template
}
export function has (name: string) {
	return templateRegistry.has(name);
}

export const templates = { add, get, has }