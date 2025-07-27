# `litedom/parse` module
this module exports a lightweight html parser of properties:
- fast and lightweight.
- not 100% spec compliant, not covering all edge cases for simplicity, and allowing some features 
like case sensitive tags and attributes.
- more strict, disallow some footgunning cases like `<div>text` and `<div><span>text</div>`.
- very customizable, see options 

this html parser is build primary for templating use cases, but it can be used for other general 
purposes.

### `parse` fucntion
```typescript
export function parse (source: string, options: Partial<Options>): LiteNode;
```
takes a source html string and return a `LiteNode` corresponding to it.

#### example
```typescript
parse('<div>hello <span id=child>world</span></div>'); 
	// => new LiteNode('div', {}, ['hello ', new LiteNode('span', { id: 'child' }, ['world'])])
```

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

	onComment: ((parent: LiteNode, text: string) => void) = () => {};
	onCData: ((parent: LiteNode, text: string) => void) = () => {};
}
```
### special tags
- `rootTag`: the root node tag, default: `<html>`.
- `voidTags`: tags of void elements, element that doesnt require close tag, like `<img>`.
- `selfCloseTags`: tags of elements that auto close if the next element has its tag.
- `rawTextTags`: tags of elements that contains raw text, their text is passed as it is and is not
parsed like `<script>` and `<style>`.

#### example
```typescript
// rootTag
parse('text', { rootTag: 'div' }); // => <div>text</div> 

// voidTags
parse('text <input> text <input/> text') // => <html>text <input/> text <input/> text</html>

// selfCloseTags
parse('<li> first <li> second <li> third </li>') 
	// => <html><li> first </li><li> second </li><li> third </li></html>

// rawTextTags
parse('<script>const value = 1; let even = "<div>"</script>')
  .children[0] // => new LiteNode('script', {}, ['const value = 1; let even = "<div>"'])
```

### whitespace
- `keepWhiteSpaceTags`: tags of elements that preserve whitespace, do not merge into a single space,
like `<pre>`.
- `keepWhiteSpace`: preserve whitespace, do not merge into a single space.

#### example
```typescript
// keepWhiteSpace
parse('hello \t\n\r world') // => new LiteNode('html', {}, ['hello world'])
parse('hello \t\n\r world', { keepWhiteSpace: true }) // => new LiteNode('html', {}, ['hello \t\n\r world'])

// keepWhiteSpaceTags
parse('hello <pre> \t\n\r  world  \t\r\n </pre>')
  .children[1] // => new LiteNode('pre', {}, [' \t\n\r  world  \t\r\n '])
```

### tags
- `tagStart`: a `RegExp` that matches the start of the tag name.
- `tagStart`: a `RegExp` that matches the rest of the tag name.
- `lowerTag`: convert the tag to lowercase as the spec.

defaults match the specification

#### example
```typescript
parse('<DIV>hello</DIV>')
  .children[0] // => new LiteNode('div', {}, ['hello'])

parse('<@Custom.Tag>hello</@Custom.Tag>') // => error

// preserve case
parse('<DIV>hello</DIV>', { lowerTag: false }) 
  .children[0] // => new LiteNode('DIV', {}, ['hello'])

// allow flexible naming for tags
parse('<@Custom.Tag>hello</@Custom.Tag>', 
	{ lowerTag: false, tagStart: /^[^\s<>='"]/, tagRest: /^[^\s<>='"]+/ }
).children[0] // => new LiteNode('@Custom.Tag', {}, ['hello'])
```

### attributes
- `attrStart`: a `RegExp` that matches the start of the attribute name.
- `attrStart`: a `RegExp` that matches the rest of the attribute name.
- `attrUnquoted`: a `RegExp` that matches the unquoted attribute value.
- `lowerAttr`: convert the attribute name to lowercase as the spec.

defaults match the specification

#### example
```typescript
parse('<div ATTR="value">hello</div>')
  .children[0] // => new LiteNode('div', { attr: 'value' }, ['hello'])

parse('<div @Attr.prop="value">hello</div>') // => error

// preserve case
parse('<div ATTR="value">hello</div>', { lowerAttr: false })
  .children[0] // => new LiteNode('div', { ATTR: 'value' }, ['hello'])

// allow flexible naming for attributes
parse('<div @Attr.prop="value">hello</div>', 
	{ lowerAttr: false, attrStart: /^[^\s<>='"]/, attrRest: /^[^\s<>='"]+/ }
).children[0] // => new LiteNode('div', { '@Attr.prop': 'value' }, ['hello'])
```

### other sections handlers
- `onComment`: a function called on every comment.
- `onCData`: a function called on every CDATA section.
**note:** comments and CDATA are ignored by default.

#### example
```typescript
parse('<!-- comment --> <div>hello</div> <![CDATA[ data ]]>') // => <html><div>hello</div></html>

parse('<!-- comment --> <div>hello</div> <![CDATA[ data ]]>', { 
	onComment: (_, value) => console.log('comment: ', value), 
	onCData: (_, value) => console.log('cdata: ', value) 
})  // => comment:  comment 
	// => cdata:  data
```