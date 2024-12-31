//component registry

import type { ConstructorFor } from "../../common/types.ts";
import type { AnyComp } from "./comp.ts";
import { Component } from "./comp.ts";
import { throw_adding_existing_class, throw_adding_existing_provider, throw_adding_root_while_there, throw_getting_undefined_class, throw_remove_unexisting_root } from "./errors.ts";
import { onAdd, onRootAdd, onRootRemove } from "./globalEvents.ts";

const classRegistry = new Map<string, ConstructorFor<AnyComp>>;
classRegistry.set('base', Component);

const IdMap = new Map<string, AnyComp>();

export type CompProvider = (name: string) => ConstructorFor<AnyComp>;

const providers = new Map<string, CompProvider>();

export function add (name: string, Class: ConstructorFor<AnyComp>) {
	if (classRegistry.has(name)) throw_adding_existing_class(name);
	classRegistry.set(name, Class);
	onAdd.trigger(name, Class);
}
export function has (name: string) {
	return classRegistry.has(name)
}
export function get (name: string) {
	if (name[0] === '@') {
		const separatorInd = name.indexOf(':');
		return providers.get(name.slice(1, separatorInd))
			?.(name.slice(separatorInd + 1)) as ConstructorFor<AnyComp>;
	}
	if (!classRegistry.has(name)) throw_getting_undefined_class(name);
	return classRegistry.get(name) as ConstructorFor<AnyComp>
}

export function addToIdMap (id: string, comp: AnyComp) {
	IdMap.set(id, comp);
}
export function getById (id: string) {
	return IdMap.get(id)
}
export function removeFromIdMap (id: string) {
	return IdMap.delete(id)
}

export function addProvider (name: string, provider: CompProvider) {
	if (providers.has(name)) throw_adding_existing_provider(name);
	providers.set(name, provider)
}

export function setRoot (comp: AnyComp) {
	if (registry.root) throw_adding_root_while_there(registry.root, comp);
	registry.root = comp;
	onRootAdd.trigger(comp);
}
export function removeRoot () {
	if (!registry.root) throw_remove_unexisting_root();
	onRootRemove.trigger(registry.root as AnyComp);
	registry.root?.remove();
	registry.root = undefined;
}

export const registry = {
	root: undefined as AnyComp | undefined,
	add, has, get, addProvider, addToIdMap, getById, removeFromIdMap, setRoot, removeRoot
}