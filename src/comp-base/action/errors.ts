import { CompError } from "../core/error.ts";
import type { AnyComp } from '../core/comp.ts'
import { compInfo } from "../core/errors.ts";

export function throw_adding_existing_action (name: string) {
	throw new CompError(`action: adding existing action handler (${name})`);
}
export function throw_undefined_action (name: string) {
	throw new CompError(`action: undefined action type (${name})`);
}
export function throw_no_attached_comp (comp: AnyComp, action: string) {
	throw new CompError(`${action} action: target has no attached component (${compInfo(comp, 'parent')})`);
}