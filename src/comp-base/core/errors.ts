import { Component, type AnyComp } from "./comp";
import { CompError } from "./error";
import type { Linkable } from "./linkable.ts";

//registry
export function throw_adding_existing_class (name: string) {
	throw new CompError(`registry: adding exsisitng class (${name})`);
}
export function throw_getting_undefined_class (name: string) {
	throw new CompError(`registry: getting undefined class (${name})`);
}
export function throw_adding_existing_provider (name: string) {
	throw new CompError(`registry: adding exsisitng provider (${name})`);
}
export function throw_adding_root_while_there (root: AnyComp, adding: AnyComp) {
	throw new CompError(`registry: adding root while there is another (${compInfo(root, 'root')}, ${compInfo(adding, 'adding')})`);
}
export function throw_remove_unexisting_root () {
	throw new CompError(`registry: removing root while there is no one`);
}

//init
export function compInfo (comp: AnyComp, name = 'comp') {
	return `${name}: ${comp.constructor.name}#${comp.id}`;
}
export function throw_no_initFn (comp: AnyComp) {
	throw new CompError(`init: component without init function (${compInfo(comp)})`)
}
function statusName (status: symbol) {
	return String(status).slice(15);
}
export function throw_incorrect_init_sequence (comp: AnyComp, calling: symbol, at: symbol) {
	throw new CompError(`init: incorrect init sequence (calling ${statusName(calling)} at ${statusName(at)}, ${compInfo(comp)})`);
}
//hierarchy
export function throw_link_Parent_while_has (comp: AnyComp, parent: AnyComp) {
	throw new CompError(`hierarchy: linking parent while already having one (${compInfo(comp)}, ${compInfo(parent, 'parent')})`);
}
export function throw_unlink_no_parent (comp: AnyComp) {
	throw new CompError(`hierarchy: unlinking unexisting parent (${compInfo(comp)})`);
}
export function throw_unlink_unowned_child (comp: AnyComp, child: AnyComp) {
	throw new CompError(`hierarchy: unlinking unowned child (${compInfo(comp)}, ${compInfo(child, 'child')})`);
}
export function throw_removing_removed_comp (comp: AnyComp) {
	throw new CompError(`hierarchy: removing removed component (${compInfo(comp)})`);
}

//linking
export function throw_linking_same (self: AnyComp | Linkable, other: Linkable) {
	throw new CompError(`linking: linking linkable that is linked (linking: ${other.constructor.name}, ${self instanceof Component ? compInfo(self) : ('to: ' + self.constructor.name)})`);
}
export function throw_unlinking_not_linked (self: AnyComp | Linkable, other: Linkable) {
	throw new CompError(`linking: unlinking linkable that is not linked (linking: ${other.constructor.name}, ${self instanceof Component ? compInfo(self, 'to') : ('to: ' + self.constructor.name)})`);
}