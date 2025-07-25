import { type ErrorCodes, raiseError } from "../core/error.ts";

export function throw_adding_existing_prop (name: string) {
	raiseError(`store: adding existing property (${name})`, 201)
}
export function throw_undefined_prop (verb: string, name: string | symbol, suffix = '', err: ErrorCodes) {
	raiseError(`store: ${verb} undefined property${suffix} (${String(name)})`, err)
}
export function throw_circular_dep_update () {
	raiseError(`update dispatcher: curcular dependency detected in update batch`, 202)
}
export function throw_track_while_tracking () {
	raiseError(`store: requested to track while tracking`, 208)
}
export function throw_end_track_while_not_tracking () {
	raiseError(`store: requested to end track while not tracking`, 209)
}