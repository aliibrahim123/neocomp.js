import { LiteNode, liteToNative, nativeToLite } from "../../litedom/core.ts";
import type { AnyComp } from "../core/comp.ts";
import { onConvertTemplate } from "../core/globalEvents.ts";
import type { Template } from "./templates.ts";
import { parse, type Options as ParseOptions } from "../../litedom/parse.ts";
import { throw_top_node_no_id, throw_text_in_root, throw_undefined_supplement_type } from "./errors.ts";
import { walk, type WalkOptions } from "./walker.ts";


export function toDom (comp: AnyComp, template: Template) {
	const el = liteToNative(template.node);
	onConvertTemplate.trigger(comp, template, el);
	return el;
}

export interface Supplement {
	type: symbol
}
export interface Plugin {
	onSource?: (source: string, options: Partial<ParseOptions>) => void;
	onDom?: (root: HTMLElement) => void;
	onRoot?: (root: LiteNode) => void;
	onTemplate?: (template: Template) => void;
	onSupplement?: (name: string, top: LiteNode) => undefined | Supplement;
}

const defaultParseOptions: Partial<ParseOptions> = {
	attrStart: /^[^'"=`<>\s]/,
	attrRest: /^[^'"=`<>\s]+/,
	lowerAttr: false,
	lowerTag: false
}
export type FileContent = Template | Supplement

function initLiteNode (node: LiteNode) {
	//add id
	node.meta.set('neocomp:id', Math.round(Math.random() * 100000000));

	for (let child of node.children) if (child instanceof LiteNode) initLiteNode(child);
}
export function generateFromLite (
	root: LiteNode, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
) {
	//init root
	initLiteNode(root);
	for (const plugin of plugins) if (plugin.onRoot) plugin.onRoot(root);
	
	//collect actions
	const actions = walk(root, walkOptions);

	//join into template
	const template = { node: root, actions };
	for (const plugin of plugins) if (plugin.onTemplate) plugin.onTemplate(template);

	return template;
}
export function generateFromString (
	source: string, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
): Record<string, FileContent> {
	//get parse options
	const parseOptions = { ...defaultParseOptions };
	for (const plugin of plugins) if (plugin.onSource) plugin.onSource(source, parseOptions);

	//parse
	const root = parse(source, parseOptions);
	
	const content: Record<string, FileContent> = {};
	let ind = 0;
	for (const child of root.children) {
		//check id and no text in root
		if (typeof(child) === 'string') return throw_text_in_root() as any;
		const id = child.attrs.get('id') as string;
		if (!id) throw_top_node_no_id(child, ind);

		//case template
		if (child.tag === 'neo:template') content[id] = generateFromLite(child, plugins, walkOptions);

		//case supplement
		else {
			let supplement: Supplement | undefined = undefined;
			//maybe a plugin that handle it
			for (const plugin of plugins) if (plugin.onSupplement) {
				supplement = plugin.onSupplement(child.tag, child);
				if (supplement) break;
			}
			//if no throw
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
	//trigger onDom
	for (const plugin of plugins) if (plugin.onDom) plugin.onDom(root);
	
	//convert to lite
	const liteRoot = nativeToLite(root);
	
	return generateFromLite(liteRoot, plugins, walkOptions);
}