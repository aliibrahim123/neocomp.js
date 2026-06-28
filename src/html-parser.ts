/** an html element ast, placeholders are represented by numbers encoding the argument index */
export interface Element {
	tag: string;
	attrs: { attr: string; value: string | number }[];
	children: (Element | string | number | { type: 'do'; arg: number })[];
}

const name_regex = /^[^<>'"`=/\s]+/;

// prettier-ignore
const void_tags = new Set([
	'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',  'param',
	'source', 'track', 'wbr'
]);

function eat_ws(part: string, ind: number): number {
	return ind + part.slice(ind).match(/^\s*/)![0].length;
}

/** throw unexpected token error */
function unexpected_token(found: string | undefined, expected: string): never {
	if (found == undefined) {
		throw new SyntaxError(`unexpected end of input, expected ${expected}`);
	}
	throw new SyntaxError(`unexpected token "${found}", expected ${expected}`);
}

/** eat a tag / attribute name */
function eat_name(part: string, ind: number, expected: string): [string, number] {
	let name = part.slice(ind).match(name_regex)?.[0];
	if (!name) unexpected_token(part[ind], expected);
	return [name, ind + name.length];
}

/** parse an html structure into simple ast, supporting placeholders and do blocks */
// grammer:
// let name = ('<' | '>' | "'" | '"' | '`' | '=' | ws)+;
// let element = ('<' name attribute* '/'? '>') (child* '<' '/' name '>')?;
// let attribute = name ('=' (name | str | ('"' | "'")? placeholder ('"' | "'")?)))?;
// let child = element | placeholder | ('<!--' _* '-->') | do | !'<'+ | '<';
// let do = '<' placeholder '/'? '>';
export function parse(parts: string[]): Element {
	let el_stack: Element[] = [
		{
			tag: 'html',
			attrs: [],
			children: [],
		},
	];

	let state: 'in_content' | 'in_attr' | 'in_do' | 'in_attr_quoted' = 'in_content';

	for (let [part_ind, part] of parts.entries()) {
		let ind = 0;
		while_part: while (part.length > ind) {
			let cur_el = el_stack.at(-1)!;

			if (state === 'in_do') {
				ind = eat_ws(part, ind);
				if (part[ind] === '/') ind += 1;
				if (part[ind] !== '>') unexpected_token(part[ind], '">"');
				ind += 1;
				state = 'in_content';
			} else if (state === 'in_attr_quoted') {
				if (part[ind] !== '"' && part[ind] !== "'") unexpected_token(part[ind], "'\"'");
				ind += 1;
				state = 'in_attr';
			} else if (state === 'in_attr') {
				ind = eat_ws(part, ind);

				// attr*
				while (ind < part.length && part[ind] !== '>' && part[ind] !== '/') {
					let attr, value;
					[attr, ind] = eat_name(part, ind, 'attribute name');
					ind = eat_ws(part, ind);

					if (part[ind] === '=') {
						ind += 1;
						ind = eat_ws(part, ind);

						// placeholder
						if (ind === part.length) {
							cur_el.attrs.push({ attr, value: part_ind });
							break while_part;
						}
						// quoted placeholder
						if ((part[ind] === '"' || part[ind] === "'") && part.length === ind + 1) {
							cur_el.attrs.push({ attr, value: part_ind });
							state = 'in_attr_quoted';
							break while_part;
						}
						if (part[ind] === '"' || part[ind] === "'") {
							let quote = part[ind];
							let end = part.indexOf(quote, ind + 1);
							if (end === -1) throw new SyntaxError('unended string');
							value = part.slice(ind + 1, end);
							ind = end + 1;
						} else [value, ind] = eat_name(part, ind, 'attribute value');

						let last_ind = ind;
						ind = eat_ws(part, ind);
						// ensure whitespace between attrs
						if (
							last_ind === ind &&
							ind < part.length &&
							part[ind] !== '>' &&
							part[ind] !== '/'
						) {
							throw new SyntaxError('expected whitespace');
						}
					} else {
						// boolean attribute
						value = '';
					}

					cur_el.attrs.push({ attr, value });
				}

				if (part[ind] === '/') {
					ind += 1;
					ind = eat_ws(part, ind);
					el_stack.pop();
				} else if (void_tags.has(cur_el.tag.toLowerCase())) el_stack.pop();

				if (part[ind] !== '>') unexpected_token(part[ind], '">"');
				ind += 1;
				state = 'in_content';
			} else {
				// extract text
				let next_bracket = part.indexOf('<', ind);
				let text = part.slice(ind, next_bracket === -1 ? part.length : next_bracket);
				if (text.length > 0) {
					// join adjacent text
					if (typeof cur_el.children.at(-1) === 'string') {
						cur_el.children[cur_el.children.length - 1] = cur_el.children.at(-1) + text;
					} else cur_el.children.push(text);
				}

				if (next_bracket === -1) break;
				ind = next_bracket + 1;

				// placeholder
				if (part.length === ind) {
					cur_el.children.push({ type: 'do', arg: part_ind });
					state = 'in_do';
				} else if (part.slice(ind, ind + 3) === '!--') {
					// comment
					let end = part.indexOf('-->', ind);
					if (end === -1) throw new SyntaxError('unended comment');
					ind = end + 3;
				} else if (part[ind] === '/') {
					// end tag
					ind += 1;
					let tag;
					[tag, ind] = eat_name(part, ind, 'tag');
					if (el_stack.length === 1) {
						throw new SyntaxError(`unexpected end tag "${tag}" at root`);
					}
					if (tag !== cur_el.tag) {
						throw new SyntaxError(`expected end tag "${cur_el.tag}" but got "${tag}"`);
					}
					ind = eat_ws(part, ind);
					if (part[ind] !== '>') unexpected_token(part[ind], '">"');
					ind += 1;
					el_stack.pop();
				} else {
					// start tag
					let tag;
					[tag, ind] = eat_name(part, ind, 'tag');
					let el: Element = { tag, attrs: [], children: [] };
					cur_el.children.push(el);
					el_stack.push(el);
					state = 'in_attr';
					ind = eat_ws(part, ind);
					if (part.length == ind) unexpected_token(undefined, '">"');
				}
			}
		}
		// placeholder in content
		if (part_ind !== parts.length - 1 && state === 'in_content') {
			el_stack.at(-1)!.children.push(part_ind);
		}
	}

	if (state !== 'in_content') unexpected_token(undefined, '">"');
	if (el_stack.length !== 1) throw new SyntaxError('end of input with unclosed tags');

	return el_stack[0];
}
