import { parseChunk, type ParsedChunk } from '../litedom/parse.ts';
import { generateFromString } from './view/generation.ts';

export * from './view/generation.ts';
export type * from './view/generation.ts';
export * from './view/tempAttr.ts';
export type * from './view/tempAttr.ts';
export * from './view/walker.ts';
export type * from './view/walker.ts';
export * from './view/walkInterface.ts';
export type * from './view/walkInterface.ts';
export { addActionAttr } from './view/actAttrs/index.ts';

export function $template (source: string) {
	return generateFromString(source)
}