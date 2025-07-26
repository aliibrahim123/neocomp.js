//interface for walk handlers that work on native and lite dom
import type { fn } from "../../common/types.ts";
import { LiteNode } from "../../litedom/node.ts";
import type { WalkOptions } from "./walker.ts";

export type Node = HTMLElement | LiteNode;

export function getTarget (node: Node) {
	return node instanceof LiteNode ? node.meta.get('neocomp:id') as number : node
}
export function* attrsOf (node: Node): Generator<[name: string, value: string]> {
	if (node instanceof LiteNode) 
		for (const [attr, value] of node.attrs) yield [attr, value as string];
	else for (const attr of node.attributes) yield [attr.name, attr.value];
}
export function hasAttr (node: Node, attr: string) {
	return node instanceof LiteNode ?
		node.attrs.has(attr) :
		node.hasAttribute(attr);
}
export function getAttr (node: Node, attr: string) {
	return node instanceof LiteNode ?
		node.attrs.get(attr) as string | undefined :
		node.attributes.getNamedItem(attr)?.value;
}
export function setAttr (node: Node, attr: string, value: string) {
	if (attr === 'text') return setText(node, value);
	if (node instanceof LiteNode) node.attrs.set(attr, value);
	else (node.attributes.getNamedItem(attr) as Attr).value = value;
}
export function toggleAttr (node: Node, attr: string, value: boolean) {
	if (value) setAttr(node, attr, '');
	else removeAttr(node, attr);
}
export function removeAttr (node: Node, attr: string) {
	if (node instanceof LiteNode) node.attrs.delete(attr);
	else node.removeAttribute(attr);
}
export function* childrenOf (node: Node): Generator<Node> {
	if (node instanceof LiteNode) for (const child of node.children) {
		if (child instanceof LiteNode) yield child;
	} else for (const child of node.children) yield child as HTMLElement;
}
export function removeChildren (node: Node) {
	if (node instanceof LiteNode) node.children = [];
	else node.replaceChildren();
}
export function getText (node: Node) {
	if (node instanceof LiteNode) {
		if (node.children.some(node => node instanceof LiteNode)) return undefined;
		else return node.children[0] as string
	}
	return node.childElementCount === 0 ? node.innerText : undefined
}
export function setText (node: Node, text: string) {
	if (node instanceof LiteNode) node.children = [text];
	else node.innerText = text
}
export function addClass (node: Node, className: string) {
	if (node instanceof LiteNode) 
		node.attrs.set('class', `${node.attrs.get('class') || ''} ${className}`);
	else node.classList.add(className);
}
export function removeClass (node: Node, className: string) {
	if (node instanceof LiteNode) 
		node.attrs.set('class', (node.attrs.get('class') || '').replace(className, ''));
	else node.classList.remove(className);
}

export class SerializedFn {
	args: string[]; 
	source: string
	constructor (args: string[], source: string) {
		this.args = args;
		this.source = source;
	}
}
export function toFun (options: WalkOptions, args: string[], source: string): fn {
	if (options.serialize) return new SerializedFn(args, source) as any as fn;
	return new Function(...args, source) as fn;
}
export function decodeAttrArg (value: string, options: WalkOptions) {
	if (options.inDom) return value.replaceAll(/-[^-]/g, v => v[1].toUpperCase())
		.replaceAll('--', '-');
	return value
}