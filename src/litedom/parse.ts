//simple html parser
//more strict, not 100% spec-compliant, added features
//build specificly for templating use cases

import { LiteNode } from "./core.ts";

export interface Options {
	rootTag: string,
	voidTags: Set<string>,
	selfCloseTags: Set<string>,
	keepWhiteSpaceTags: Set<string>,
	keepWhiteSpace: boolean,
	rawTextTags: Set<string>,
	tagStart: RegExp,
	tagRest: RegExp,
	lowerTag: boolean,
	attrStart: RegExp,
	attrRest: RegExp,
	attrUnquoted: RegExp,
	lowerAttr: boolean,
	onComment: (parent: LiteNode, text: string) => void;
	onCData: (parent: LiteNode, text: string) => void;
}

export const defaultOptions: Options = {
	rootTag: 'html',
	keepWhiteSpace: false,
	//auto close (no end tag)
	voidTags: new Set([
		'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source',
		'track', 'wbr'
	]),
	//self close if followed by start tag of same tag: <T>....<T>....</T> -> <T>....</T><T>....</T>
	selfCloseTags: new Set([
		'colgroup', 'dd', 'dt', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr'
	]),
	keepWhiteSpaceTags: new Set(['pre']),
	rawTextTags: new Set(['script', 'style']),
	onComment: () => {},
	onCData: () => {},
	tagStart: /^[a-zA-Z]/,
	tagRest: /^[a-zA-Z:0-9-]+/,
	lowerTag: true,
	attrStart: /^[a-zA-Z:_]/,
	attrRest: /^[a-zA-Z:_.0-9-]+/,
	attrUnquoted: /^[^\s'"=<>`]+/,
	lowerAttr: true
}

export function parse (source: string, opts: Partial<Options>): LiteNode {
	const options = {...defaultOptions, ...opts};
	const { 
		keepWhiteSpace, tagStart, tagRest, lowerTag, attrStart, attrRest, lowerAttr, attrUnquoted,
		keepWhiteSpaceTags, rawTextTags
	} = options;
	const root = new LiteNode(options.rootTag), stack = [root];
	let lastTag = '', parentWSTags = 0;
	let ind = 0;
	
	while (ind < source.length) {
		const curNode = stack.at(-1) as LiteNode, children = curNode.children;
		//next '<', if curnode is raw text, next end tag of it
		const nextBracket = source.indexOf(
			rawTextTags.has(curNode.tag) ? `</${curNode.tag}>` : '<', 
		ind);

		//slice text, if not '<' found, take till end of input
		let text = source.slice(ind, nextBracket === -1 ? source.length : nextBracket);
		//if there are actual text (not whitespace)
		if (text && !text.match(/^\s+$/g)) {
			//remove whitespace
			if (!(keepWhiteSpace || parentWSTags > 0 || rawTextTags.has(curNode.tag)))
				text = text.replaceAll(/\s+/g, ' ');
			//join if last child is text, else append
			if (typeof(children.at(-1)) === 'string') children[children.length -1] += text;
			else curNode.append(text);
		}

		//if not '<' found, finished
		if (nextBracket === -1) break;
		//ind is now at next '<'
		ind = nextBracket;
		const afterBracket = source[nextBracket + 1] as string;
		//comment
		if (afterBracket === '!' && source.slice(ind, ind + 4) === '<!--') {
			parseComment(curNode);
			continue
		}
		//cdata
		if (afterBracket === '!' && source.slice(ind, ind + 9) === '<![CDATA[') {
			parseCData(curNode);
			continue
		}
		//tag start
		if (tagStart.test(afterBracket)) {
			parseStartTag(curNode);
			continue
		}
		//tag end
		if (afterBracket === '/' && tagStart.test(source[ind + 2] as string)) {
			parseEndTag(curNode);
			continue
		}
		//else '<' is just a text, join else append
		if (typeof(children.at(-1)) === 'string') children[children.length -1] += '<';
		else curNode.append('<');
		ind++;
	}

	if (stack.length > 1) throw new 
		SyntaxError(`litedom.parse: ended input with ${stack.length -1} unclosed tags`);
	return root;

	function parseStartTag (parentNode: LiteNode) {
		//extract tag
		const startInd = ind;
		let tag = source.slice(ind + 1).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		ind += 1 + tag.length;

		//case self close
		if (lastTag === tag && options.selfCloseTags.has(tag)) stack.pop();

		const node = new LiteNode(tag);
		stack.at(-1)?.append(node);
		stack.push(node);
		lastTag = tag;
		
		//attributes
		let thereWasWS = false;
		while (source[ind] !== '>' && source[ind] !== '/') {
			if (skipWhiteSpace() && !thereWasWS) throw new 
				SyntaxError(`litedom.parse: expected whitespace at (${ind})`);
			thereWasWS = false;

			if (source[ind] === '>') break;
			if (source[ind] === '/') break;

			//attribute name
			if (!attrStart.test(source[ind])) throw new
				SyntaxError(`litedom.parse: expected attribute at (${ind})`);
			const attr = source.slice(ind).match(attrRest)?.[0] as string;
			ind += attr.length;
			
			//case empty value
			const thereIsNoWS = skipWhiteSpace();
			if (source[ind] !== '=') {
				const isEnd = source[ind] === '>' || source[ind] === '/';
				if (!isEnd && thereIsNoWS) throw new 
					SyntaxError(`litedom.parse: unexpected token at (${ind})`);
				thereWasWS = true;
				node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, '');
				if (isEnd) break;
				continue;
			}
			ind++; //skip '='
			skipWhiteSpace();

			let value = '';
			//double quoted
			if (source[ind] === '"') {
				const quoteEnd = source.indexOf('"', ind + 1);
				if (quoteEnd === -1) throw new SyntaxError(
					`litedom.parse: unexpected end of quoted attribute value at (${ind})`
				);
				value = source.slice(ind + 1, quoteEnd);
				ind = quoteEnd + 1;
			}
			//single quoted
			else if (source[ind] === "'") {
				const quoteEnd = source.indexOf("'", ind + 1);
				if (quoteEnd === -1) throw new SyntaxError(
					`litedom.parse: unexpected end of quoted attribute value at (${ind})`
				);
				value = source.slice(ind + 1, quoteEnd);
				ind = quoteEnd + 1;
			}
			//unqouted
			else {
				value = source.slice(ind).match(attrUnquoted)?.[0] as string;
				if (!value) throw new 
					SyntaxError(`litedom.parse: unexpected token at (${ind})`);
				ind += value.length
			}
			node.attrs.set(lowerAttr ? attr.toLowerCase() : attr, value);
		}

		//handle classList
		if (node.attrs.has('class')) {
			node.classList = new Set((node.attrs.get('class') as string).split(' '));
			node.attrs.delete('class');
		}

		//case void
		if (source[ind] === '/') stack.pop();
		else if (options.voidTags.has(tag)) stack.pop();

		if (keepWhiteSpaceTags.has(stack.at(-1)?.tag as string)) parentWSTags++;

		ind+= source[ind] === '/' ? 2 : 1; //skip '>'
	}
	function parseEndTag (curNode: LiteNode) {
		//extract tag
		let tag = source.slice(ind + 2).match(tagRest)?.[0] as string;
		tag = lowerTag ? tag.toLowerCase() : tag;
		const nextBracket = source.indexOf('>');

		if (nextBracket === -1) throw new SyntaxError(`litedom.parse: unended end tag at (${ind})`);
		//other than whitespace between tag and '>'
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
		ind += 3 + tag.length;
	}
	function parseComment (curNode: LiteNode) {
		const commentEnd = source.indexOf('-->', ind + 4);
		if (commentEnd === -1) throw new 
			SyntaxError(`litedom.parse: unended comment at (${ind})`);
		options.onComment(curNode, source.slice(ind + 4, commentEnd));
		ind = commentEnd + 3;
	}
	function parseCData (curNode: LiteNode) {
		const cdataEnd = source.indexOf(']]>', ind + 9);
		if (cdataEnd === -1) throw new 
			SyntaxError(`litedom.parse: unended comment at (${ind})`);
		options.onComment(curNode, source.slice(ind + 9, cdataEnd));
		ind = cdataEnd + 3;
	}

	function skipWhiteSpace () {
		const match = source.slice(ind).match(/^\s*/)?.[0] as string;
		ind += match.length;
		return match.length === 0
	}
}