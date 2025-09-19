// lite dom respresentation

import { LiteNode } from "./node.ts";

export function liteToNative (
  lite: LiteNode, converters: Record<string, (lite: LiteNode) => Node> = {}
): HTMLElement {
	// use given converter if defined
	if (lite.tag in converters) return converters[lite.tag](lite) as HTMLElement;

	// construct normally
	const native = document.createElement(lite.tag);
	for (const [name, value] of lite.attrs) native.setAttribute(name, String(value));
	for (const child of lite.children) 
		native.append(child instanceof LiteNode ? liteToNative(child, converters) : child);

	return native
}

export function nativeToLite (native: Element): LiteNode {
	const lite = new LiteNode(native.tagName.toLowerCase());
	for (const attr of native.attributes) lite.attrs.set(attr.name, attr.value);
	for (const child of native.childNodes) 
		if (child instanceof Text) lite.append(child.textContent || '');
		else if (child instanceof Element) lite.append(nativeToLite(child));
	return lite
}

export { LiteNode }