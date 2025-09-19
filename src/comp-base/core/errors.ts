import { Component, type PureComp, type Status } from "./comp";
import { errorsLevels, raiseError } from "./error";
import type { Linkable } from "./linkable.ts";

// registry
export function throw_adding_existing_class (name: string) {
	raiseError(`registry: adding exsisitng class (${name})`, 101);
}
export function throw_getting_undefined_class (name: string) {
	raiseError(`registry: getting undefined class (${name})`, 102);
}
export function throw_using_undefined_provider (name: string) {
	raiseError(`registry: using undefined provider (${name})`, 103);
}
export function throw_adding_existing_provider (name: string) {
	raiseError(`registry: adding exsisitng provider (${name})`, 104);
}
export function throw_adding_root_while_there (root: PureComp, adding: PureComp) {
	raiseError(
		`registry: adding root while there is another (${compInfo(root, 'root')}, ${compInfo(adding, 'adding')})`,
		105
	);
}
export function throw_remove_unexisting_root () {
	raiseError(`registry: removing root while there is no one`, 106);
}

// init
export function compInfo (comp: PureComp, name = 'comp') {
	return `${name}: ${comp.constructor.name}#${comp.id}`;
}

export function throw_incorrect_init_sequence (comp: PureComp, calling: Status, at: Status) {
	raiseError(`init: incorrect init sequence (calling ${calling} at ${at}, ${compInfo(comp)})`, 107);
}

// hierarchy
export function throw_adding_child_out_of_range (comp: PureComp, child: PureComp, ind: number) {
	raiseError(
		`hierarchy: adding child out of range (index: ${ind} / ${comp.children.length}, ${compInfo(comp)}, ${compInfo(child, 'child')})`,
		108
	);
}
export function throw_link_Parent_while_has (comp: PureComp, parent: PureComp) {
	raiseError(
		`hierarchy: linking parent while already having one (${compInfo(comp)}, ${compInfo(parent, 'parent')})`,
		109
	);
}
export function throw_unlink_no_parent (comp: PureComp) {
	raiseError(`hierarchy: unlinking unexisting parent (${compInfo(comp)})`, 110);
}
export function throw_unlink_unowned_child (comp: PureComp, child: PureComp) {
	raiseError(
		`hierarchy: unlinking unowned child (${compInfo(comp)}, ${compInfo(child, 'child')})`,
		111
	);
}
export function throw_removing_removed_comp (comp: PureComp) {
	raiseError(`hierarchy: removing removed component (${compInfo(comp)})`, 112);
}

// linking
export function throw_linking_linked (self: PureComp | Linkable, other: Linkable) {
	raiseError(
		`linking: linking linkable that is linked (linking: ${other.constructor.name}, ${self instanceof Component ? compInfo(self) : ('to: ' + self.constructor.name)})`,
		113
	);
}
export function throw_unlinking_not_linked (self: PureComp | Linkable, other: Linkable) {
	raiseError(
		`linking: unlinking linkable that is not linked (linking: ${other.constructor.name}, ${self instanceof Component ? compInfo(self, 'to') : ('to: ' + self.constructor.name)})`,
		114
	);
}

export function throw_undefined_info_dump_type (type: string) {
	raiseError(`info dump: requesting undefined type ${type}`, 117);
}