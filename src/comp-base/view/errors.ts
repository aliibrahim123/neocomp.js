import type { LiteNode } from "../../litedom/node.ts";
import { compInfo } from "../core/errors.ts";
import { Component } from '../core/comp.ts'
import { errorsLevels, raiseError } from '../core/error.ts'

// template registry
export function throw_adding_existing_template (name: string) {
	raiseError(`template registry: adding exsisitng template (${name})`, 301);
}
export function throw_getting_undefined_template (name: string) {
	raiseError(`template registry: getting undefined template (${name})`, 302);
}

// view
export function throw_multiple_roots (comp: Component) {
	raiseError(`view: multiple elements at root in template (${compInfo(comp)})`, 301);
}
export function throw_not_into_query (comp: Component) {
	raiseError(`view: no into query while insertMode is into (${compInfo(comp)})`, 303);
}
export function throw_into_query_no_match (comp: Component, query: string) {
	raiseError(`view: into query has not match (query: ${query}, ${compInfo(comp)})`, 304);
}
export function throw_undefined_chunk (comp: Component, name: string) {
	raiseError(`view: using undefined chunk (name: ${name}, ${compInfo(comp)})`, 307);
}

// template parse
export function throw_text_in_root () {
	raiseError(`template parse: unexpected text in root`, 401);
}
export function throw_top_node_no_id (node: LiteNode, ind: number) {
	raiseError(`template parse: top node without an id (node: ${node.tag} at ${ind})`, 402);
}
export function throw_undefined_supplement_type (node: LiteNode, id: string) {
	raiseError(
		`template parse: undefined supplement type (type: ${node.tag}), node: (${node.tag}#${id})`,
		403
	);
}

// tAttr
export function throw_tattr_unended_prop_args_in_name (attr: string) {
	raiseError(`TAttr: unexpected unended property argumanets at attribute (${attr})`, 404);
}
export function throw_tattr_no_text (attr: string) {
	raiseError(`TAttr: target is text while node has node children, expected only text (${attr})`, 405);
}

export function throw_tattr_unexpected_token (token: string, ind: number, attr: string) {
	raiseError(`TAttr: unexpected token (${token}) at (${ind}) of attribute (${attr})`, 406);
}
export function throw_tattr_unended_exp (type: string, ind: number, attr: string) {
	raiseError(
		`TAttr: unexpected unended ${type ? type + ' ' : ''}expression at (${ind}) of attribute (${attr})`,
		407
	);
}
export function throw_tattr_unended_prop_args (ind: number, attr: string) {
	raiseError(`TAttr: unexpected unended property arguments at (${ind}) of attribute (${attr})`, 408);
}
export function throw_tattr_escape_seq_at_end (ind: number, attr: string) {
	raiseError(
		`TAttr: unexpected unended escape sequence at the end of input at (${ind}) of attribute (${attr})`,
		409
	);
}
export function throw_tattr_invalid_escape_seq (seq: string, ind: number, attr: string) {
	raiseError(`TAttr: invalid escape sequence (${seq}) at (${ind}) of attribute (${attr})`, 410);
}

// action attrs
export function throw_adding_existing_act_attr (name: string) {
	raiseError(`action attributes: adding existing action attribute handler (${name})`, 305);
}
export function throw_getting_undefined_act_attr (name: string) {
	raiseError(`action attributes: getting undefined action attribute handler (${name})`, 306);
}
export function throw_on_attr_no_args () {
	raiseError(`@on attr: no event arguments`, 411);
}
export function throw_chunk_attr_no_name () {
	raiseError(`@chunk attr: no chunk name`, 412);
}
export function throw_attr_no_props (attr: string) {
	raiseError(`@${attr} attr: no property arguments`, 413);
}

// chunk
export function throw_chunk_cond_not_met (cond: string) {
	raiseError(`chunk: expetced condition not met (cond: ${cond})`, 413);
}