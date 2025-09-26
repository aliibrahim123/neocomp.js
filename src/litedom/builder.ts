import type { LiteNode } from "./node.ts";
import type { ParsedChunk } from "./parse.ts";

/** create a dom struture from source chunks */
export function builder (
	el: HTMLElement | string = 'div',
	refiner: (lite: LiteNode, native: HTMLElement) => void = () => { },
	converters: Record<string, (lite: LiteNode) => Node> = {}
) {
	let rootEl = el instanceof HTMLElement ? el : document.createElement(el);
	let curEl = rootEl, stack = [rootEl];
	let builded = false;

	return { add, end };

	/** add a parsed chunk to the structure */
	function add (chunk: ParsedChunk) {
		// update changed parents
		for (const [ind, node] of chunk.parents.entries()) {
			// pop element when finished
			if (ind !== 0) {
				if (stack.length === 1)
					throw new TypeError(`litedom.builder: closing root with tag ${node.tag}`);

				let elTag = curEl.tagName.toLowerCase();
				if (elTag !== node.tag) throw new SyntaxError(
					`litedom.builder: end tag (${node.tag}) is different from start tag (${elTag})`
				);

				stack.pop();
				curEl = stack.at(-1)!;
			}
			updateEl(node, curEl);
		}

		// get element the chunk stoped in
		let curLite = chunk.parents.at(-1)!;
		for (let i = 0; i < chunk.curNodeDepth; i++) {
			curLite = curLite.children.at(-1)! as LiteNode;
			stack.push(curEl = curEl.children[curEl.children.length - 1] as HTMLElement)
		}
	}
	/** update a native element from lite representation */
	function updateEl (lite: LiteNode, native: HTMLElement) {
		// attrs
		for (const [attr, value] of lite.attrs)
			native.setAttribute(attr, value);
		// child
		for (const child of lite.children)
			// text
			if (typeof (child) === 'string') native.append(child);
			// handled by a converter
			else if (converters[child.tag]) native.append(converters[child.tag](child));
			// normal element
			else native.append(updateEl(child, document.createElement(child.tag)));

		refiner(lite, native);
		return native
	}
	/** build the structure */
	function end () {
		if (builded) throw new TypeError('litedom.builder: calling build twice');
		builded = true;

		if (stack.length !== 1) throw new TypeError('litedom.builder: building unfinished structure');

		return rootEl
	}
}