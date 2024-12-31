import { CompError } from "../core/error.ts";

export function throw_adding_existing_prop (name: string) {
	throw new CompError(`store: adding existing property (${name})`)
}
export function throw_undefined_prop (verb: string, name: string | symbol, suffix = '') {
	throw new CompError(`store: ${verb} undefined property${suffix} (${String(name)})`)
}
export function throw_circular_dep_update () {
	throw new CompError(`update dispatcher: curcular dependency detected in update batch`)
}