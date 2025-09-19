import { liteToNative } from "../../litedom/core.ts";
import type { LiteNode } from "../../litedom/node.ts";
import { type PureComp, onConvertTemplate } from "../core.ts";
import type { Template } from "./templates.ts";


export function toDom(
	comp: PureComp, template: Template, converters: Record<string, (lite: LiteNode) => Node> = {}
) {
	const el = liteToNative(template.root, {
		// svg converter
		svg(lite) {
			const svg = document.createElementNS('http:// www.w3.org/2000/svg', 'svg');
			for (const [name, value] of lite.attrs) svg.setAttribute(name, String(value));
			svg.innerHTML = lite.children.join('');
			return svg;
		},
		...converters
	});
	onConvertTemplate.trigger(comp, template, el);
	return el;
}
