import { errorsLevels, raiseError } from "../core/error.ts";
import type { PureComp } from '../core/comp.ts'
import { compInfo } from "../core/errors.ts";

export function throw_adding_existing_action (name: string) {
	raiseError(`action: adding existing action handler (${name})`, 115);
}
export function throw_undefined_action (name: string) {
	raiseError(`action: undefined action type (${name})`, 116);
}
export function throw_no_attached_comp (comp: PureComp, action: string) {
	raiseError(`${action} action: target has no attached component (${compInfo(comp, 'parent')})`, 306);
}