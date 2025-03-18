//templated attribute
//features:
//	- {mono exp}
//	- \... escapes
//	- #{const exp}
//	- ${static prop}
//	- $(static props){exp}
//	- @{dynamic prop}
//	- @(dynamic props){exp}

import { 
	throw_tattr_escape_seq_at_end, throw_tattr_invalid_escape_seq, throw_tattr_uneded_exp, 
	throw_tattr_unended_prop_args, throw_tattr_unexpected_token
} from "./errors.ts";
import type { WalkOptions } from "./walker.ts";
import type { AnyComp } from '../core/comp.ts';
import { toFun } from "./walkInterface.ts";
import type { Fn } from "./walkInterface.ts";
import type { fn } from "../../common/types.ts";

const nextTokenExp = /[\\@#$]/;

export interface TAttrExp {
	isExp: true;
	fn: Fn
	dynamics: string[],
	statics: string[]
}
export interface TAttrProp {
	isExp: false;
	prop: string,
	static: boolean
}
export type TAttrPart = string | TAttrProp | TAttrExp;
export type TAttr = Fn | TAttrPart[];

export function parseTAttr (source: string, attr: string, options: WalkOptions, globalArgs: string[]): TAttr {
	//case mono exp
	if (source[0] === '{') {
		if (source.at(-1) !== '}') throw_tattr_uneded_exp('', 0, attr);

		let exp = source.slice(1, -1);
		exp = exp.includes(';') ? exp : 'return ' + exp;

		return toFun(options, globalArgs, exp)
	}

	let ind = 0;
	let curText: string[] = [], parts: TAttrPart[] = [];
	while (ind < source.length) {
		//locate next token
		const nextTokenInd = source.slice(ind).match(nextTokenExp)?.index;
		//push text betweeen
		curText.push(source.slice(ind, nextTokenInd === undefined ? source.length : ind + nextTokenInd));
		//not token, end
		if (nextTokenInd === undefined) break;
		ind += nextTokenInd;
		const nextToken = source[ind];

		//escape sequence
		if (nextToken === '\\') handleEscapeSeq();

		//const exp
		else if (nextToken === '#') {
			//case not #{, skip
			if (source[ind + 1] !== '{') {
				curText.push('#');
				ind++;
				continue;
			}

			//locate end of exp
			const isDoubleBracket = source[ind + 2] === '{';
			const expEnd = source.indexOf(isDoubleBracket ? '}}' : '}', ind);
			if (expEnd === -1) throw_tattr_uneded_exp('constant', ind, attr);

			//excute exp and add it
			const exp = source.slice(ind + (isDoubleBracket ? 3 : 2), expEnd);
			curText.push(new Function(exp.includes(';') ? exp : 'return ' + exp)());
			ind = expEnd + (isDoubleBracket ? 2 : 1);
		}

		//static exp / prop
		else if (nextToken === '$') {
			//case ${prop}
			const nextChar = source[ind + 1];
			if (nextChar === '{') {
				const propEnd = source.indexOf('}', ind);
				if (propEnd === -1) throw_tattr_uneded_exp('static', ind, attr);
				addPreText();
				parts.push({ isExp: false, prop: source.slice(ind +2, propEnd), static: true });
				ind = propEnd +1;
				continue;
			}

			//case not $(, skip
			if (nextChar !== '(') {
				curText.push('$');
				ind++;
				continue;
			}

			addPreText();
			handleStaticExp();
		}

		//dynamic exp / prop
		else {
			//case @{prop}
			const nextChar = source[ind + 1];
			if (nextChar === '{') {
				const propEnd = source.indexOf('}', ind);
				if (propEnd === -1) throw_tattr_uneded_exp('dynamic', ind, attr);
				addPreText();
				parts.push({ isExp: false, prop: source.slice(ind +2, propEnd), static: false });
				ind = propEnd +1;
				continue;
			}

			//case not @(, skip
			if (nextChar !== '(') {
				curText.push('@');
				ind++;
				continue;
			}

			addPreText();
			handleDynamicExp();
		}
	}
	//add remaining text
	addPreText();

	return parts;

	function addPreText () {
		if (curText.length === 0) return;
		parts.push(curText.join(''));
		curText = [];
	}
	function handleEscapeSeq () {
		const nextChar = source[ind + 1];
		//uneded seq at end of input (1 \)
		if (ind +1 === source.length) throw_tattr_escape_seq_at_end(ind, attr);
		//special characters escapes
		if      (nextChar === '0') curText.push('\0');
		else if (nextChar === 'n') curText.push('\n');
		else if (nextChar === 'r') curText.push('\r');
		else if (nextChar === 'v') curText.push('\v');
		else if (nextChar === 't') curText.push('\t');
		else if (nextChar === 'b') curText.push('\b');
		else if (nextChar === 'f') curText.push('\f');

		//\x..
		else if (nextChar === 'x') {
			const code = Number.parseInt(source.slice(ind+2, ind+4), 16);
			if (Number.isNaN(code)) throw_tattr_invalid_escape_seq(source.slice(ind, ind+4), ind, attr);
			curText.push(String.fromCodePoint(code));
			ind += 2; //+2 down
		}
		//\u....
		else if (nextChar === 'u' && source[ind + 2] !== '{') {
			const code = Number.parseInt(source.slice(ind+2, ind+6), 16);
			if (Number.isNaN(code)) throw_tattr_invalid_escape_seq(source.slice(ind, ind+6), ind, attr);
			curText.push(String.fromCharCode(code));
			ind += 4; //+2 down
		}
		//\u{...}
		else if (nextChar === 'u' && source[ind + 2] === '{') {
			const nextBracket = source.indexOf('}', ind +2);
			const code = Number.parseInt(source.slice(ind+3, nextBracket), 16);
			if (Number.isNaN(code)) 
				throw_tattr_invalid_escape_seq(source.slice(ind, nextBracket +1), ind, attr);
			curText.push(String.fromCodePoint(code));
			ind = nextBracket -1; //+2 down
		}

		//unkown char, add it, solve \' \" \\ ...
		else curText.push(nextChar);
		ind += 2;
	}
	function handleStaticExp () {
		const startInd = ind;
		//get props
		const nextBracket = source.indexOf(')', ind);
		if (nextBracket === -1) throw_tattr_unended_prop_args(startInd, attr);
		const props = source.slice(startInd + 2, nextBracket).split(',').map(prop => prop.trim());

		//locate exp borders
		ind = nextBracket + 1;
		if (source[ind] !== '{') throw_tattr_unexpected_token(source[ind], ind, attr);
		const isDoubleBracket = source[ind + 1] === '{';
		const expEnd = source.indexOf(isDoubleBracket ? '}}' : '}', ind);
		if (expEnd === -1) throw_tattr_uneded_exp('static', startInd, attr);

		//create exp fn and add it
		const exp = source.slice(ind + (isDoubleBracket ? 2 : 1), expEnd);
		const fn = toFun(options, globalArgs.concat(props), exp.includes(';') ? exp : 'return ' + exp);
		parts.push({ isExp: true, fn, dynamics: [], statics: props });
		ind = expEnd + (isDoubleBracket ? 2 : 1);
	}
	function handleDynamicExp () {
		const startInd = ind;
		//get props
		const nextBracket = source.indexOf(')', ind);
		if (nextBracket === -1) throw_tattr_unended_prop_args(startInd, attr);
		const props = source.slice(startInd + 2, nextBracket).split(',').map(prop => prop.trim());
		const staticProps: string[] = [], dynamicProps: string[] = [];
		for (const prop of props)
			if (prop[0] === '$') staticProps.push(prop.slice(1));
			else dynamicProps.push(prop);

		//locate exp borders
		ind = nextBracket + 1;
		if (source[ind] !== '{') throw_tattr_unexpected_token(source[ind], ind, attr);
		const isDoubleBracket = source[ind + 1] === '{';
		const expEnd = source.indexOf(isDoubleBracket ? '}}' : '}', ind);
		if (expEnd === -1) throw_tattr_uneded_exp('dynamic', startInd, attr);

		//create exp fn and add it
		const exp = source.slice(ind + (isDoubleBracket ? 2 : 1), expEnd);
		const fn = toFun(options, 
			globalArgs.concat(staticProps, dynamicProps), 
			exp.includes(';') ? exp : 'return ' + exp
		);
		parts.push({ isExp: true, fn, dynamics: dynamicProps, statics: staticProps });
		ind = expEnd + (isDoubleBracket ? 2 : 1);
	}
}

export function evalTAttr (attr: TAttr, comp: AnyComp, el: HTMLElement, props: any[]) {
	if (Array.isArray(attr)) return attr.map(part => {
		//string
		if (typeof(part) === 'string') return part;
		//prop
		if (!part.isExp) return comp.store.get(part.prop);
		//exp
		return (part.fn as fn)(comp, el, 
		  ...props.concat(part.statics.concat(part.dynamics).map(prop => comp.store.get(prop)))
		);
	}).join('');

	else return (attr as fn)(comp, el, ...props);
}