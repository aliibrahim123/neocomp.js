// simple html parser
// more strict, not 100% spec-compliant, added features
// build specificly for templating use cases

import { LiteNode } from "./core.ts";

/** options for litedom.parse */
export interface Options {
	/** tag for the root element */
	rootTag: string,
	/** tags of elements that don't need end tag */
	voidTags: Set<string>,
	/** tags of elements that don't need end tag if followed by start tag of same element */
	selfCloseTags: Set<string>,
	/** tags of elements to preserve whitespace in text */
	keepWhiteSpaceTags: Set<string>,
	/** preserve whitespace in text */
	keepWhiteSpace: boolean,
	/** tags of elements of raw text content, there content is passed without parsing */
	rawTextTags: Set<string>,
	/** pattern of the first character of a tag */
	tagStart: RegExp,
	/** pattern of the rest of a tag */
	tagRest: RegExp,
	//** convert tag to lowercase */
	lowerTag: boolean,
	/** pattern of the first character of an attribute name */
	attrStart: RegExp,
	/** pattern of the rest of an attribute name */
	attrRest: RegExp,
	/** pattern of an unquoted attribute value */
	attrUnquoted: RegExp,
	/** convert attribute name to lowercase */
	lowerAttr: boolean,
	/** callback for comments */
	onComment: (parent: LiteNode, text: string) => void;
	/** callback for cdata */
	onCData: (parent: LiteNode, text: string) => void;
}

export const defaultOptions: Options = {
	rootTag: 'html',
	keepWhiteSpace: false,
	voidTags: new Set([
		'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source',
		'track', 'wbr'
	]),
	selfCloseTags: new Set([
		'colgroup', 'dd', 'dt', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr'
	]),
	keepWhiteSpaceTags: new Set(['pre']),
	rawTextTags: new Set(['script', 'style']),
	onComment: () => { },
	onCData: () => { },
	tagStart: /^[a-zA-Z]/,
	tagRest: /^[a-zA-Z:0-9-]+/,
	lowerTag: true,
	attrStart: /^[a-zA-Z:_]/,
	attrRest: /^[a-zA-Z:_.0-9-]+/,
	attrUnquoted: /^[^\s'"=<>/`]+/,
	lowerAttr: true
}

/** parsing context */
type Ctx = {
	ind: number,
	source: string,
	options: Options,
}

/** parse html source into litedom node */
export function parse(source: string, opts: Partial<Options> = {}): LiteNode {
	const options = { ...defaultOptions, ...opts };
	const {
		keepWhiteSpace, tagStart, tagRest, lowerTag, attrStart, attrRest, lowerAttr, attrUnquoted,
		keepWhiteSpaceTags, rawTextTags
	} = options;
	const root = new LiteNode(options.rootTag), stack = [root];
	let parentWSTags = 0; // parents with whitespace preserve tags
	let ind = 0;

	while (ind < source.length) {
		const curNode = stack.at(-1) as LiteNode, children = curNode.children;

		// next '<', if curNode is raw text, next end tag of it
		const nextBracket = source.indexOf(
			rawTextTags.has(curNode.tag) ? `</${curNode.tag}>` : '<',
			ind);

		// slice text, if not '<' found, take till end of input
		let text = source.slice(ind, nextBracket === -1 ? source.length : nextBracket);
		// if there are actual text (not whitespace)
		if (text && !text.match(/^\s+$/g)) {
			// remove whitespace
			if (!(keepWhiteSpace || parentWSTags > 0 || rawTextTags.has(curNode.tag)))
				text = text.replaceAll(/\s+/g, ' ');
			// join if last child is text, else append
			if (typeof (children.at(-1)) === 'string') children[children.length - 1] += text;
			else curNode.append(text);
		}

		// if not '<' found, finished
		if (nextBracket === -1) break;
		// ind is now at next '<'
		ind = nextBracket;
		const afterBracket = source[nextBracket + 1] as string;
		let ctx = { ind: nextBracket, source, options };

		// comment
		if (afterBracket === '!' && source.slice(ind, ind + 4) === '<!--') {
			parseComment(curNode, ctx);
			ind = ctx.ind;
		}
		// cdata
		else if (afterBracket === '!' && source.slice(ind, ind + 9) === '<![CDATA[') {
			parseCData(curNode, ctx);
			ind = ctx.ind;
		}
		// tag start
		else if (tagStart.test(afterBracket)) 
			parseStartTag(curNode);
		// tag end
		else if (afterBracket === '/' && tagStart.test(source[ind + 2] as string)) 
			parseEndTag(curNode);
		else {
			// else '<' is just a text, join else append
			if (typeof (children.at(-1)) === 'string') children[children.length - 1] += '<';
			else curNode.append('<');
			ctx.ind = ind + 1;
		}
	}

	if (stack.length > 1) throw new
		SyntaxError(`litedom.parse: ended input with ${stack.length - 1} unclosed tags`);
	return root;

	function parseStartTag(parentNode: LiteNode) {
		// extract tag
		const startInd = ind;
		let tag = source.slice(ind + 1).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		ind += 1 + tag.length;

		// case self close
		if (stack.at(-1)?.tag === tag && options.selfCloseTags.has(tag)) stack.pop();

		const node = new LiteNode(tag);
		stack.at(-1)?.append(node);
		stack.push(node);

		// parse attributes
		let thereWasWS = false;
		while (source[ind] !== '>' && source[ind] !== '/') {
			// disallow <tag attr="value"attr="value"
			if (skipWhiteSpace() && !thereWasWS) throw new
				SyntaxError(`litedom.parse: expected whitespace at (${ind})`);
			thereWasWS = false;

			if (source[ind] === '>') break;
			if (source[ind] === '/') break;

			// attribute name
			if (!attrStart.test(source[ind])) throw new
				SyntaxError(`litedom.parse: expected attribute at (${ind})`);
			const attr = source.slice(ind).match(attrRest)?.[0] as string;
			ind += attr.length;

			// case empty value
			const thereIsNoWS = skipWhiteSpace();
			if (source[ind] !== '=') {
				// allow <tag attr>
				const isEnd = source[ind] === '>' || source[ind] === '/';
				if (!isEnd && thereIsNoWS) throw new
					SyntaxError(`litedom.parse: unexpected token at (${ind})`);
				thereWasWS = true;

				node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, '');

				if (isEnd) break;
				continue;
			}
			ind++; // skip '='
			skipWhiteSpace();

			let value = '';
			let curChar = source[ind];
			// extract quoted
			if (curChar === '"' || curChar === "'") {
				const quoteEnd = source.indexOf(curChar, ind + 1);
				if (quoteEnd === -1) throw new SyntaxError(
					`litedom.parse: unexpected end of quoted attribute value at (${ind})`
				);
				value = source.slice(ind + 1, quoteEnd);
				ind = quoteEnd + 1;
			}
			// extract unqouted
			else {
				value = source.slice(ind).match(attrUnquoted)?.[0] as string;
				if (!value) throw new
					SyntaxError(`litedom.parse: unexpected token at (${ind})`);
				ind += value.length
			}
			node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, value);
		}

		// case void, pop node
		if (source[ind] === '/') stack.pop();
		else if (options.voidTags.has(tag)) stack.pop();

		// do not use tag since we may pop it above
		else if (keepWhiteSpaceTags.has(stack.at(-1)?.tag as string)) parentWSTags++;

		ind += source[ind] === '/' ? 2 : 1; // skip '>'
	}
	function parseEndTag(curNode: LiteNode) {
		// extract tag
		let tag = source.slice(ind + 2).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		const nextBracket = source.indexOf('>');

		if (nextBracket === -1) throw new SyntaxError(`litedom.parse: unended end tag at (${ind})`);
		// other than whitespace between tag and '>'
		if (!source.slice(ind + 2 + tag.length, nextBracket).match(/^\s*/))
			throw new SyntaxError(`litedom.parse: invalid end tag at (${ind})`);

		if (stack.length === 1) throw new SyntaxError(
			`litedom.parse: unexpected end tag (${tag}) at root at (${ind})`
		);
		if (curNode.tag !== tag) throw new SyntaxError(
			`litedom.parse: end tag (${tag}) is different from start tag (${curNode.tag}) at (${ind})`
		);

		if (keepWhiteSpaceTags.has(tag)) parentWSTags--;

		stack.pop();
		ind += 3 + tag.length; // skip '</...>'
	}
	function skipWhiteSpace() {
		const match = source.slice(ind).match(/^\s*/)?.[0] as string;
		ind += match.length;
		return match.length === 0
	}
}

/** a parsed chunk of an html source */
export interface ParsedChunk {
	state: ParseState,
	parents: LiteNode[],
	curNode: LiteNode,
	stops: ({ node: LiteNode} & ({ at: 'content' | 'attrs' } | { at: 'attr_value', attr: string })) []
}
/** state passed between chunk parsing instances */
interface ParseState {
	inside: 'content' | 'attrs',
	parentWSTags: number
};
/** parse a chunk of an html source */
export function parseChunk (
	parts: string[], opts: Partial<Options> = {}, 
	lastState: ParseState = { inside: 'content', parentWSTags: 0 }
) {
	const options = { ...defaultOptions, ...opts };
	const {
		keepWhiteSpace, tagStart, tagRest, lowerTag, attrStart, attrRest, lowerAttr, attrUnquoted,
		keepWhiteSpaceTags, rawTextTags
	} = options;
	let curRoot = new LiteNode(options.rootTag), stack = [curRoot], parents = [curRoot];
	let stops: ParsedChunk['stops'] = [];
	let parentWSTags = 0; // parents with whitespace preserve tags
	let inside = lastState.inside, part: string, ind = 0, partStart = 0;

	for (part of parts) {
		ind = 0;
		// parse content of part
		while (ind < part.length) switch (inside) {
			case 'content': parseContent(); break;
			case 'attrs': parseAttrs(stack.at(-1)!, false); break;
		}
		// allow successes stops without content separating them
		if (part.length === 0) switch (inside) {
			case 'content': stops.push({ node: stack.at(-1)!, at: 'content' }); break;
			case 'attrs': stops.push({ node: stack.at(-1)!, at: 'attrs' }); break;
		}
		
		partStart += part.length;
	}

	// remove last stop since there is no content after it
	stops.pop();

	return { 
		state: { inside, parentWSTags }, parents, stops, curNode: stack.at(-1)!
	} satisfies ParsedChunk;

	/** parse content of an element */
	function parseContent () {
		const curNode = stack.at(-1) as LiteNode, children = curNode.children;

		// next '<', if curNode is raw text, next end tag of it
		const nextBracket = part.indexOf(
			rawTextTags.has(curNode.tag) ? `</${curNode.tag}>` : '<',
		ind);

		// slice text, if not '<' found, take till end of input
		let text = part.slice(ind, nextBracket === -1 ? part.length : nextBracket);
		// if there are actual text (not whitespace)
		if (text && !text.match(/^\s+$/g)) {
			// remove whitespace
			if (!(keepWhiteSpace || parentWSTags > 0 || rawTextTags.has(curNode.tag)))
				text = text.replaceAll(/\s+/g, ' ');
			// join if last child is text, else append
			if (typeof (children.at(-1)) === 'string') children[children.length - 1] += text;
			else curNode.append(text);
		}

		// if '<' not found in part, there is a stop
		if (nextBracket === -1) {
			ind = part.length;
			stops.push({ node: curNode, at: 'content' });
			return
		};

		// ind is now at next '<'
		ind = nextBracket;
		let ctx = { ind, source: part, options };
		const afterBracket = part[nextBracket + 1] as string;
		// comment
		if (afterBracket === '!' && part.slice(ind, ind + 4) === '<!--') {
			parseComment(curNode, ctx);
			ind = ctx.ind;
		}
		// cdata
		else if (afterBracket === '!' && part.slice(ind, ind + 9) === '<![CDATA[') {
			parseCData(curNode, ctx);
			ind = ctx.ind;
		}
		// tag start
		else if (tagStart.test(afterBracket)) 
			parseStartTag();
		// tag end
		else if (afterBracket === '/' && tagStart.test(part[ind + 2] as string)) 
			parseEndTag(curNode);
		else {
			// else '<' is just a text, join else append
			if (typeof (children.at(-1)) === 'string') children[children.length - 1] += '<';
			else curNode.append('<');
			ind = ind + 1;
		}
	}
	function parseStartTag() {
		// extract tag
		let tag = part.slice(ind + 1).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		ind += 1 + tag.length;

		// case self close
		if (stack.at(-1)?.tag === tag && options.selfCloseTags.has(tag)) stack.pop();

		// create node
		const node = new LiteNode(tag);
		stack.at(-1)?.append(node);
		stack.push(node);

		// parse attributes
		inside = 'attrs';
		parseAttrs(node, true);
	}
	/** parse attributes of an element */
	function parseAttrs (node: LiteNode, expectWS: boolean) {
		let thereWasWS = !expectWS;
		while (part[ind] !== '>' && part[ind] !== '/' && ind < part.length) {
			// disallow <tag attr="value"attr="value">
			if (skipWhiteSpace() && !thereWasWS) throw new
				SyntaxError(`litedom.parse: expected whitespace at (${ind + partStart})`);
			thereWasWS = false;

			// break if end
			if (part[ind] === '>' || part[ind] === '/' || ind >= part.length) break;

			// extract attribute name
			if (!attrStart.test(part[ind])) throw new
				SyntaxError(`litedom.parse: expected attribute at (${ind + partStart})`);
			const attr = part.slice(ind).match(attrRest)?.[0] as string;
			ind += attr.length;

			// case empty value
			const thereIsNoWS = skipWhiteSpace();
			if (part[ind] !== '=') {
				// allow <tag attr>
				const isEnd = part[ind] === '>' || part[ind] === '/' || ind >= part.length;

				if (!isEnd && thereIsNoWS) throw new
					SyntaxError(`litedom.parse: unexpected token at (${ind + partStart})`);
				thereWasWS = true;

				node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, '');

				if (isEnd) break;
				continue;
			}
			ind++; // skip '='
			skipWhiteSpace();

			// case stop in attribute value
			if (ind >= part.length) {
				stops.push({ node, at: 'attr_value', attr });
				return
			}

			let value = '', curChar = part[ind];
			// extract quoted
			if (curChar === '"' || curChar === "'") {
				const quoteEnd = part.indexOf(curChar, ind + 1);
				if (quoteEnd === -1) throw new SyntaxError(
					`litedom.parse: unexpected end of quoted attribute value at (${ind + partStart})`
				);

				value = part.slice(ind + 1, quoteEnd);
				ind = quoteEnd + 1;
			}
			// extract unqouted
			else {
				value = part.slice(ind).match(attrUnquoted)?.[0] as string;
				if (!value) throw new
					SyntaxError(`litedom.parse: unexpected token at (${ind + partStart})`);
				ind += value.length
			}
			node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, value);
		}

		// case stop between attributes
		if (ind >= part.length) {
			stops.push({ node, at: 'attrs' });
			return
		};

		handleStartTagEnd(node);
	}
	/** handle commons functionality of start tag after attrs */
	function handleStartTagEnd (node: LiteNode) {
		// case void, pop it from stck
		if (part[ind] === '/') stack.pop();
		else if (options.voidTags.has(node.tag)) stack.pop();

		// case keep whitespace element
		else if (keepWhiteSpaceTags.has(stack.at(-1)?.tag as string)) parentWSTags++;

		inside = 'content';
		ind += part[ind] === '/' ? 2 : 1; // skip '>'

		// case stop after start tag
		if (ind >= part.length) stops.push({ node: stack.at(-1)!, at: 'content' });
	}
	function parseEndTag(curNode: LiteNode) {
		// extract tag
		let tag = part.slice(ind + 2).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		const nextBracket = part.slice(ind + 2).indexOf('>') + ind + 2;

		if (nextBracket === -1) throw new 
			SyntaxError(`litedom.parse: unended end tag at (${ind + partStart})`);
		
		// other than whitespace between tag and '>'
		if (!part.slice(ind + 2 + tag.length, nextBracket).match(/^\s*$/))
			throw new SyntaxError(`litedom.parse: invalid end tag at (${ind})`);

		// case closing root tag, change root to its parent
		if (stack.length === 1) {
			curRoot.tag = tag;
			curRoot = new LiteNode(tag);
			stack = [curRoot];
			parents.push(curRoot);
		}
		else {
			let realInd = ind + partStart;
			if (curNode.tag !== tag) throw new SyntaxError(
				`litedom.parse: end tag (${tag}) is different from start tag (${curNode.tag}) at (${realInd})`
			);
			stack.pop();
		}

		if (keepWhiteSpaceTags.has(tag)) parentWSTags--;

		ind += 3 + tag.length; // skip '</...>'
	}
	function skipWhiteSpace() {
		const match = part.slice(ind).match(/^\s*/)?.[0] as string;
		ind += match.length;
		return match.length === 0
	}
}

function parseComment(curNode: LiteNode, ctx: Ctx) {
	const { source, ind, options } = ctx;
	const commentEnd = source.indexOf('-->', ind + 4);
	if (commentEnd === -1) throw new
		SyntaxError(`litedom.parse: unended comment at (${ind})`);
	options.onComment(curNode, source.slice(ind + 4, commentEnd));
	ctx.ind = commentEnd + 3;
}
function parseCData(curNode: LiteNode, ctx: Ctx) {
	const { source, ind, options } = ctx;
	const cdataEnd = source.indexOf(']]>', ind + 9);
	if (cdataEnd === -1) throw new
		SyntaxError(`litedom.parse: unended comment at (${ind})`);
	options.onComment(curNode, source.slice(ind + 9, cdataEnd));
	ctx.ind = cdataEnd + 3;
}
