import { CompError } from "../core.ts";

export function throw_adding_existing_action (name: string) {
	throw new CompError(`action: adding existing action handler (${name})`);
}
export function throw_undefined_action (name: string) {
	throw new CompError(`action: undefined action type (${name})`);
}