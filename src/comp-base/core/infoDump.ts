import type { ConstructorFor } from "../../common/types.ts";
import { throw_undefined_info_dump_type } from "./errors.ts";
import { infoDump as registryInfoDump, type CompProvider } from "./registry.ts";
import type { Component } from "./comp.ts";
import { infoDump as chunksInfoDump } from "../view/chunk.ts";
import type { ParsedChunk } from "../../litedom/parse.ts";

/** dump global information */
export function infoDump (type: 'classes'): Record<string, ConstructorFor<Component>>;
export function infoDump (type: 'providers'): Record<string, CompProvider>;
export function infoDump (type: 'idMap'): Record<string, Component>;
export function infoDump (type: 'chunks'): Record<string, ParsedChunk>;
export function infoDump (type: 'classes' | 'providers' | 'idMap' | 'chunks'): any {
	if (type === 'classes' || type === 'idMap' || type === 'providers') return registryInfoDump(type);
	if (type === 'chunks') return chunksInfoDump(type);
	throw_undefined_info_dump_type(type);
}
