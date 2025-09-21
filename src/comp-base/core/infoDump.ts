import type { ConstructorFor } from "../../common/types.ts";
import { throw_undefined_info_dump_type } from "./errors.ts";
import { infoDump as registryInfoDump, type CompProvider } from "./registry.ts";
import type { Component } from "./comp.ts";

export function infoDump (type: 'classes'): Record<string, ConstructorFor<Component>>;
export function infoDump (type: 'providers'): Record<string, CompProvider>;
export function infoDump (type: 'idMap'): Record<string, Component>;
export function infoDump (type: 'classes' | 'providers' | 'idMap'): any {
	if (type === 'classes' || type === 'idMap' || type === 'providers') return registryInfoDump(type);
	throw_undefined_info_dump_type(type);
}
