// component registry

import type { ConstructorFor } from "../../common/types.ts";
import { Component } from "./comp.ts";
import { throw_adding_existing_class, throw_adding_existing_provider, throw_adding_root_while_there, throw_getting_undefined_class, throw_remove_unexisting_root, throw_undefined_info_dump_type, throw_using_undefined_provider } from "./errors.ts";
import { onAdd, onRootAdd, onRootRemove } from "./globalEvents.ts";

/** component class registry */
const classRegistry = new Map<string, ConstructorFor<Component>>;

/** registry of components by id */
const IdMap = new Map<string, Component>();

/** provider providing component classes */
export type CompProvider = (name: string) => ConstructorFor<Component>;

/** component providers */
const providers = new Map<string, CompProvider>();

/** register a component class */
export function add (name: string, Class: ConstructorFor<Component>) {
	if (classRegistry.has(name)) throw_adding_existing_class(name);
	classRegistry.set(name, Class);
	onAdd.trigger(name, Class as any);
}
/** check if a component class is registered */
export function has (name: string) {
	return classRegistry.has(name)
}
/** get a component class */
export function get (name: string) {
	if (name[0] === '@') {
		const separatorInd = name.indexOf(':');
		const provider = providers.get(name.slice(1, separatorInd))
		if (!provider) throw_using_undefined_provider(name.slice(1, separatorInd));
		return provider?.(name.slice(separatorInd + 1)) as ConstructorFor<Component>;
	}
	if (!classRegistry.has(name)) throw_getting_undefined_class(name);
	return classRegistry.get(name) as ConstructorFor<Component>
}

/** register a component provider */
export function addProvider (name: string, provider: CompProvider) {
	if (providers.has(name)) throw_adding_existing_provider(name);
	providers.set(name, provider)
}

/** add a component to the id map */
export function addToIdMap (id: string, comp: Component) {
	IdMap.set(id, comp);
}
/** get a component from the id map */
export function getById (id: string) {
	return IdMap.get(id)
}
/** remove a component from the id map */
export function removeFromIdMap (id: string) {
	return IdMap.delete(id)
}

/** set a component as the root */
export function setRoot (comp: Component) {
	if (registry.root) throw_adding_root_while_there(registry.root, comp);
	registry.root = comp;
	onRootAdd.trigger(comp);
}
/** unregister the root */
export function removeRoot () {
	if (!registry.root) throw_remove_unexisting_root();
	onRootRemove.trigger(registry.root);
	registry.root = undefined as any;
}

/** dump information about the registry */
export function infoDump (type: 'classes' | 'providers' | 'idMap') {
	if (type === 'classes') return Object.fromEntries(classRegistry);
	if (type === 'providers') return Object.fromEntries(providers);
	if (type === 'idMap') return Object.fromEntries(IdMap);
}

export const registry = {
	root: undefined as any as Component,
	add, has, get, addProvider, addToIdMap, getById, removeFromIdMap, setRoot, removeRoot
}