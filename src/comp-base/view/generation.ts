import { LiteNode, nativeToLite } from "../../litedom/core.ts";
import type { Template } from "./templates.ts";
import { parse, parseChunk, type ParsedChunk, type Options as ParseOptions } from "../../litedom/parse.ts";
import { throw_top_node_no_id, throw_text_in_root, throw_undefined_supplement_type } from "./errors.ts";
import { walk, type WalkOptions } from "./walker.ts";


export interface Supplement {
	type: symbol
}
export interface Plugin {
	onSource?: (source: string[], args: any[], options: Partial<ParseOptions>, meta: Map<string, any>) => void;
	onChunk?: (chunk: ParsedChunk, meta: Map<string, any>) => void;
	onDom?: (root: HTMLElement, meta: Map<string, any>) => void;
	onRoot?: (root: LiteNode, meta: Map<string, any>) => void;
	onTemplate?: (template: Template, meta: Map<string, any>) => void;
	onSupplement?: (name: string, top: LiteNode, meta: Map<string, any>) => undefined | Supplement;
}

const defaultParseOptions: Partial<ParseOptions> = {
	rootTag: 'neo:template',
	tagStart: /^[^'"=`<>/\s]/,
	tagRest: /^[^'"=`<>/\s]+/,
	attrStart: /^[^'"=`<>\s]/,
	attrRest: /^[^'"=`<>\s]+/,
	lowerAttr: false,
	rawTextTags: new Set(['script', 'style', 'svg']),
	lowerTag: false
}
export type FileContent = Template | Supplement

function initLiteNode (node: LiteNode) {
	// add id
	node.meta.set('neocomp:id', Math.round(Math.random() * 100000000));

	for (let child of node.children) if (child instanceof LiteNode) initLiteNode(child);
}
function fromLite (
	root: LiteNode, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}, meta: Map<string, any>
) {
	// init root
	initLiteNode(root);
	for (const plugin of plugins) if (plugin.onRoot) plugin.onRoot(root, meta);

	// collect actions
	const actions = walk(root, walkOptions);

	// join into template
	const template = { root, actions };
	for (const plugin of plugins) if (plugin.onTemplate) plugin.onTemplate(template, meta);

	return template;
}
export function generateFromLite (
	root: LiteNode, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
) {
	return fromLite(root, plugins, walkOptions, new Map());
}
export function generateFromString (
	source: string, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
) {
	const meta = new Map();
	// get parse options
	const parseOptions = { ...defaultParseOptions };
	//for (const plugin of plugins) if (plugin.onSource) plugin.onSource(source, parseOptions, meta);

	// parse
	let root = parse(source, parseOptions);
	if (root.children[0] instanceof LiteNode && root.children[0].tag === 'neo:template')
		root = root.children[0];

	// generate
	return fromLite(root, plugins, walkOptions, meta);
}
export function generateFromSource (
	source: string, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
): Record<string, FileContent> {
	const meta = new Map();
	// get parse options
	const parseOptions = { ...defaultParseOptions };
	//for (const plugin of plugins) if (plugin.onSource) plugin.onSource([source], parseOptions, meta);

	// parse
	const root = parse(source, parseOptions);

	const content: Record<string, FileContent> = {};
	let ind = 0;
	for (const child of root.children) {
		// check id and no text in root
		if (typeof (child) === 'string') return throw_text_in_root() as any;
		const id = child.attrs.get('id') as string;
		if (!id) throw_top_node_no_id(child, ind);

		// case template
		if (child.tag === 'neo:template') content[id] = fromLite(child, plugins, walkOptions, meta);

		// case supplement
		else {
			let supplement: Supplement | undefined = undefined;
			// maybe a plugin that handle it
			for (const plugin of plugins) if (plugin.onSupplement) {
				supplement = plugin.onSupplement(child.tag, child, meta);
				if (supplement) break;
			}
			// if no throw
			if (!supplement) throw_undefined_supplement_type(child, id);
			content[id] = supplement as Supplement;
		}
		ind++;
	}

	return content
}
export function generateFromDom (
	root: HTMLElement, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
): Template {
	const meta = new Map();
	// trigger onDom
	for (const plugin of plugins) if (plugin.onDom) plugin.onDom(root, meta);

	// convert to lite
	const liteRoot = nativeToLite(root);

	return fromLite(liteRoot, plugins, walkOptions, meta);
}