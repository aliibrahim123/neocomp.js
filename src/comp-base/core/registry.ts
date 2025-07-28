//component registry

import type { ConstructorFor } from "../../common/types.ts";
import type { PureComp } from "./comp.ts";
import { Component } from "./comp.ts";
import { throw_adding_existing_class, throw_adding_existing_provider, throw_adding_root_while_there, throw_getting_undefined_class, throw_remove_unexisting_root, throw_undefined_info_dump_type, throw_using_undefined_provider } from "./errors.ts";
import { onAdd, onRootAdd, onRootRemove } from "./globalEvents.ts";

const classRegistry = new Map<string, ConstructorFor<PureComp>>;
classRegistry.set('base', Component);

const IdMap = new Map<string, PureComp>();

export type CompProvider = (name: string) => ConstructorFor<PureComp>;

const providers = new Map<string, CompProvider>();

export function add (name: string, Class: ConstructorFor<PureComp>) {
	if (classRegistry.has(name)) throw_adding_existing_class(name);
	classRegistry.set(name, Class);
	onAdd.trigger(name, Class as any);
}
export function has (name: string) {
	return classRegistry.has(name)
}
export function get (name: string) {
	if (name[0] === '@') {
		const separatorInd = name.indexOf(':');
		const provider = providers.get(name.slice(1, separatorInd)) 
		if (!provider) throw_using_undefined_provider(name.slice(1, separatorInd));
		return provider?.(name.slice(separatorInd + 1)) as ConstructorFor<PureComp>;
	}
	if (!classRegistry.has(name)) throw_getting_undefined_class(name);
	return classRegistry.get(name) as ConstructorFor<PureComp>
}

export function addProvider (name: string, provider: CompProvider) {
	if (providers.has(name)) throw_adding_existing_provider(name);
	providers.set(name, provider)
}

export function addToIdMap (id: string, comp: PureComp) {
	IdMap.set(id, comp);
}
export function getById (id: string) {
	return IdMap.get(id)
}
export function removeFromIdMap (id: string) {
	return IdMap.delete(id)
}


export function setRoot (comp: PureComp) {
	if (registry.root) throw_adding_root_while_there(registry.root, comp);
	registry.root = comp;
	onRootAdd.trigger(comp);
}
export function removeRoot () {
	if (!registry.root) throw_remove_unexisting_root();
	onRootRemove.trigger(registry.root);
	registry.root = undefined as any;
}

export function infoDump (type: 'classes' | 'providers' | 'idMap') {
	if (type === 'classes') return Object.fromEntries(classRegistry);
	if (type === 'providers') return Object.fromEntries(providers);
	if (type === 'idMap') return Object.fromEntries(IdMap);
}

export const registry = {
	root: undefined as any as PureComp,
	add, has, get, addProvider, addToIdMap, getById, removeFromIdMap, setRoot, removeRoot
}