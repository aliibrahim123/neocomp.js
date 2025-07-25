import type { ConstructorFor } from "../../common/types.ts";
import type { PureComp } from "./comp.ts";
import { throw_undefined_info_dump_type } from "./errors.ts";
import { infoDump as registryInfoDump, type CompProvider } from "./registry.ts";
import { infoDump as actionsInfoDump } from '../action/actions.ts'
import type { Template } from "../view/templates.ts";
import { infoDump as templatesInfoDump } from "../view/templates.ts";

export function infoDump (type: 'classes'): Record<string, ConstructorFor<PureComp>>;
export function infoDump (type: 'providers'): Record<string, CompProvider>;
export function infoDump (type: 'idMap'): Record<string, PureComp>;
export function infoDump (type: 'actions'): string[];
export function infoDump (type: 'templates'): Record<string, Template>;
export function infoDump (type: 'classes' | 'providers' | 'idMap' | 'actions' | 'templates'): any {
	if (type === 'classes' || type === 'idMap' || type === 'providers') return registryInfoDump(type);
	if (type === 'actions') return actionsInfoDump(type);
	if (type === 'templates') return templatesInfoDump(type);
	throw_undefined_info_dump_type(type);
}
