//lite dom respresentation

import { LiteNode } from "./node.ts";

export function liteToNative (lite: LiteNode): HTMLElement {
	const native = document.createElement(lite.tag);
	for (const [name, value] of lite.attrs) native.setAttribute(name, String(value));
	if (lite.classList.size) native.classList.add(...lite.classList);
	for (const child of lite.children) 
		native.append(child instanceof LiteNode ? liteToNative(child) : child);

	return native
}

export function nativeToLite (native: Element): LiteNode {
	const lite = new LiteNode(native.tagName.toLowerCase());
	for (const attr of native.attributes) 
		if (attr.name !== 'class') lite.attrs.set(attr.name, attr.value);
	lite.classList = new Set(native.classList);
	for (const child of native.childNodes) 
		if (child instanceof Text) lite.append(child.textContent || '');
		else if (child instanceof Element) lite.append(nativeToLite(child));
	return lite
}

export { LiteNode }