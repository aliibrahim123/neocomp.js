# `litedom/parse` module
this module contain a lightweight fast not 100% spec compliant more strict customizable html
parser.

it is a simple html parser that covers the base spec but not all edge cases.

### `parse`
```typescript
export function parse (source: string, options: Partial<Options>): LiteNode;
```
this function takes a source html string and return a `LiteNode` representing it.

## `Options`
```typescript
export interface Options {
	rootTag: string = 'html',
	voidTags: Set<string> = new Set([
		'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source',
		'track', 'wbr'
	]),
	selfCloseTags: Set<string> = new Set([
		'colgroup', 'dd', 'dt', 'li', 'options', 'p', 'td', 'tfoot', 'th', 'thead', 'tr'
	]),
	rawTextTags: Set<string> = new Set(['script', 'style']),

	keepWhiteSpaceTags: Set<string> = new Set(['pre']),
	keepWhiteSpace: boolean = false,

	tagStart: RegExp = /^[a-zA-Z]/,
	tagRest: RegExp = /^[a-zA-Z:0-9-]+/,
	lowerTag: boolean = true,

	attrStart: RegExp = /^[a-zA-Z:_]/,
	attrRest: RegExp = /^[a-zA-Z:_.0-9-]+/,
	attrUnquoted: RegExp = /^[^\s'"=<>`]+/,
	lowerAttr: boolean = true,

	onComment: ((parent: LiteNode, text: string) => void) = noop;
	onCData: ((parent: LiteNode, text: string) => void) = noop;
}
```
### special tags
- `rootTag`: the root node tag.
- `voidTags`: tags of void elements, element that doesnt require close tag.
- `selfCloseTags`: tags of elements that auto close if the next start tag is the same as the last.
- `rawTextTags`: tags of elements that contains raw text, their text is passed as it is and is not
parsed like `'script'` and `'style'`.

### whitespace
- `keepWhiteSpaceTags`: tags of elements that keep whitespace as it is like `'pre'`.
- `keepWhiteSpace`: keep whitespace as it is.

### tags
- `tagStart`: a `RegExp` that matches the start of the tag name.
- `tagStart`: a `RegExp` that matches the rest of the tag name.
- `lowerTag`: convert the tag to lowercase as the spec.

### attributes
- `attrStart`: a `RegExp` that matches the start of the attribute name.
- `attrStart`: a `RegExp` that matches the rest of the attribute name.
- `attrUnquoted`: a `RegExp` that matches the unquoted attribute value.
- `lowerAttr`: convert the attribute name to lowercase as the spec.

### other sections handlers
- `onComment`: a function called on every comment.
- `onCData`: a function called on every CDATA section.