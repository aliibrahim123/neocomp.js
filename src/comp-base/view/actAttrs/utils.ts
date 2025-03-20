import type { WalkOptions } from "../walker.ts";
import { toFun, type Fn } from "../walkInterface.ts";

export type TName = { 
	type: 'prop' | 'literial', 
	value: string 
} | { 
	type: 'exp', 
	value: Fn 
};
export function parseTName (value: string, option: WalkOptions): TName {
	if (value.startsWith('$:')) return {
		type: 'exp', value: toFun(option, ['comp', 'el', 'context'], 'return ' + value.slice(2))
	};
	if (value.startsWith('$')) return { type: 'prop', value: value.slice(1) }
	return { type: 'literial', value };
}