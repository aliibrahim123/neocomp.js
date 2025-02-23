import type { LiteNode } from "../../litedom/node.ts";
import { compInfo } from "../core/errors.ts";
import type { AnyComp } from '../core/comp.ts'
import { CompError } from '../core/error.ts'

//template registry
export function throw_adding_existing_template (name: string) {
	throw new CompError(`template registry: adding exsisitng template (${name})`);
}
export function throw_getting_undefined_template (name: string) {
	throw new CompError(`template registry: getting undefined template (${name})`);
}

//init dom
export function throw_not_into_query (comp: AnyComp) {
	throw new CompError(`view: no into query while insertMode is into (${compInfo(comp)})`);
}
export function throw_into_query_no_match (comp: AnyComp, query: string) {
	throw new CompError(`view: into query has not match (query: ${query}, ${compInfo(comp)})`);
}

//template parse
export function throw_text_in_root () {
	throw new CompError(`template parse: unexpected text in root`);
}
export function throw_top_node_no_id (node: LiteNode, ind: number) {
	throw new CompError(`template parse: top node without an id (node: ${node.tag} at ${ind})`);
}
export function throw_undefined_supplement_type (node: LiteNode, id: string) {
	throw new CompError(`template parse: undefined supplement type (type: ${node.tag}), node: (${node.tag}#${id})`);
}

//tAttr
export function throw_tattr_unended_prop_args_in_name (attr: string) {
	throw new CompError(`TAttr: unexpected unended property argumanets at attribute (${attr})`);
}
export function throw_tattr_no_text (attr: string) {
	throw new CompError(`TAttr: target is text while node has node children, expected only text (${attr})`);
}

export function throw_tattr_unexpected_token (token: string, ind: number, attr: string) {
	throw new CompError(`TAttr: unexpected token (${token}) at (${ind}) of attribute (${attr})`);
}
export function throw_tattr_uneded_exp (type: string, ind: number, attr: string) {
	throw new CompError(`TAttr: unexpected unended ${type ? type + ' ' : ''}expression at (${ind}) of attribute (${attr})`);
}
export function throw_tattr_unended_prop_args (ind: number, attr: string) {
	throw new CompError(`TAttr: unexpected unended property arguments at (${ind}) of attribute (${attr})`);
}
export function throw_tattr_escape_seq_at_end (ind: number, attr: string) {
	throw new CompError(`TAttr: unexpected unended escape sequence at the end of input at (${ind}) of attribute (${attr})`);
}
export function throw_tattr_invalid_escape_seq (seq: string, ind: number, attr: string) {
	throw new CompError(`TAttr: invalid escape sequence (${seq}) at (${ind}) of attribute (${attr})`);
}

//action attrs
export function throw_adding_existing_act_attr (name: string) {
	throw new CompError(`action attributes: adding existing action attribute handler (${name})`);
}
export function throw_getting_undefined_act_attr (name: string) {
	throw new CompError(`action attributes: getting undefined action attribute handler (${name})`);
}
export function throw_comp_this_multiple () {
	throw new CompError(`@comp\\:this attr: detected multiple comp:this attr`);
}
export function throw_on_attr_no_args () {
	throw new CompError(`@on attr: no event arguments`);
}
export function throw_attr_no_props (attr: string) {
	throw new CompError(`@${attr} attr: no property arguments`);
}