# `litedom` module
this module is the main module of litedom, a lightweight DOM representation.

it provides a lightweight representation for DOM meant for storage and serialization.

## `LiteNode` class
a class representing `HTMLElement` in a lightweight manner.

### constructor and properties
```typescript
export class LiteNode {
	constructor (
  	  tag: string, attrs: Record<string, string> = {},
	  children: (string | LiteNode)[] = [], meta: Record<string, any> = {}
	);

	tag: string;
	attrs: Map<string, string | number | boolean>;
	meta: Map<string, any>;
}
```
`constructor`: construct a new `LiteNode` of specified tag, optionally taking attributes, children 
and metadata.

`tag`: the tag name of the node, in lowercase.

`attrs`: a `Map` of the attributes of the node.

`meta`: a `Map` of user defined metadata of the node.

#### example
```typescript
const node = new LiteNode('div', { id: 'id' });
const nodeWithMeta = new LiteNode('div', {}, [], { key: 'value' });

node.tag // => 'div'

node.attrs.get('id') // => 'id'
node.attrs.get('class') // => undefined
node.attrs.set('class', 'class'); // => <div id=id class=class></div>

nodeWithMeta.meta.get('key') // => 'value';
```

### hierarchy related properties
```typescript
export class LiteNode {
	parent: LiteNode | undefined;
	children: (string | LiteNode)[];

	get childIndex (): number | undefined;
	get nextSibling (): LiteNode | string | undefined;
	get prevSibling (): LiteNode | string | undefined;
}
```
`parent`: the parent of the node.

`children`: the children of the node, `string` represent text nodes while `LiteNode` represent elements.

`childIndex`: returns the index of the node in its parent, `undefined` if there is no parent.

`nextSibling` and `prevSibling`: returns the respectful sibling of the node, `undefined` if there 
is no parent.

#### example
```typescript
const parent = new LiteNode('div', {}, ['some text', new LiteNode('span'), new LiteNode('img')]);

parent.children // => ['some text', <span>, <img>]

parent.parent // => undefined
parent.children[1].parent // => parent

parent.children[1].childIndex // => 1

const [_, span, img] = parent.children;
span.nextSibling // => <img>
img.prevSibling // => <span>
span.prevSibling // => 'some text'
img.nextSibling // => undefined
```

### insertion methods
```typescript
export class LiteNode {
	append (...children: (LiteNode | string)[]);
	prepend (...children: (LiteNode | string)[]);
	insertAt (ind: number, ...children: (LiteNode | string)[]);

	before (...newSiblings: (LiteNode | string)[]);
	after (...newSiblings: (LiteNode | string)[]);
}
```
`append`: insert the passed nodes at the bottom of the node.

`prepend`: insert the passed nodes at the top of the node.

`insertAt`: insert the passend nodes at the specified index.  
index can be negative relative to the last child, out of range indexes clamp to the bounds.

`before`: insert the given nodes before the node in its parent.

`after`: insert the given nodes after the node in its parent.

**node**: children can be either `LiteNode` or `string`, fail silently if there is no parent. 

#### example
```typescript
const parent = new LiteNode('div', {}, ['some text']);

parent.append(new LiteNode('span')); 
parent.children; // => ['some text', <span>]

parent.prepend(new LiteNode('span'), 'other text');
parent.children; // => [<span>, 'other text', <span>, 'some text']

parent.insertAt(1, new LiteNode('img'));
parent.children; // => [<span>, <img>, 'other text', <span>, 'some text']
parent.insertAt(-1, new LiteNode('img'));
parent.children; // => [<span>, <img>, 'other text', <span>, 'some text', <img>]
parent.insertAt(10, new LiteNode('input'));
parent.children; // => [<span>, <img>, 'other text', <span>, 'some text', <img>, <input>]

const parent = new LiteNode('div', {}, [new LiteNode('span')]);
const node = parent.children[0];

node.before(new LiteNode('img'));
parent.children; // => [<img>, <span>]

node.after('some text', new LiteNode('img'));
parent.children; // => [<img>, <span>, 'some text', <img>]
```

### removing methods
```typescript
export class LiteNode {
	remove ();
	replaceWith (node: LiteNode | string);

	removeChild (ind: number);
	replaceChild (ind: number, child: LiteNode | string);
	removeChildren ();
}
```
`remove`: remove the node from its parent.

`replaceWith`: replace the node in its parent with the given node.

**note:** these functions fail silently if there is no parent.

`removeChild`: remove the child at the given index.

`replaceChild`: replace the child at the given index with the given child.

**note:** these functions fail silently if there is no child at index.

`removeChildren`: remove all childrens from the node.

#### example
```typescript
const parent = new LiteNode('div', {}, [new LiteNode('span'), new LiteNode('img')]);

parent.children[0].remove();
parent.children; // => [<img>]

parent.children[0].replaceWith(new LiteNode('span'));
parent.children; // => [<span>]

parent.append(new LiteNode('img'));

parent.removeChild(0);
parent.children; // => [<img>]

parent.replaceChild(0, new LiteNode('span'));
parent.children; // => [<span>]

parent.removeChildren();
parent.children; // => []
```

## nodes convertion functions
```typescript
export function liteToNative 
  (lite: LiteNode, converters: Record<string, (lite: LiteNode) => Node> = {}): HTMLElement;
export function nativeToLite (native: HTMLElement): LiteNode;
```
this functions convert between `HTMLElement` and `LiteNode`.

`liteToNative`: convert a `LiteNode` to `HTMLElement` with all of its children.    
optionally take `converters`, a `Record` of functions used to convert `LiteNode`s of a given tag
name to `Node`s.

`nativeToLite`: convert a `HTMLElement` to `LiteNode` with all of its children.

**note:** these functions convert only attributes and children (elements and text nodes), they do
not convert event handlers, properties defined on elements, or other nodes like comments. 

#### example
```typescript
const lite = new LiteNode('div', { id: 'parent' }, ['hallo ', new LiteNode('span', {}, ['world'])]);
const native = liteToNative(node); // => <div id="parent">hallo <span>world</span></div>

const native = /* <div id="parent">hallo <span>world</span></div> */
const lite = nativeToLite(native); // => new LiteNode('div', { id: 'parent' }, ['hallo ', new LiteNode('span', {}, ['world'])])
```

## `builder` module
```typescript
export function builder (
	el: HTMLElement | string = 'div',
	refiner: (lite: LiteNode, native: HTMLElement) => void = () => { },
	converters: Record<string, (lite: LiteNode) => Node> = {}
): {
	add (chunk: ParsedChunk): void;
	end (): HTMLElement;
}
```
this module export `builder` function that build a DOM structure from a series of `ParsedChunk`s.

it take optionaly `el`, the root element or its tag, a `refiner` function called on each element to adjust it, and a map of `converters` that converts litenodes of specific tag into dom nodes. 

`refiner` is called multiple times on the same element if encountered in deffirent chunks.

#### example
```typescript
let { add, end } = builder('div', (lite, el) => {
	if (lite.meta.has('id')) el.setAttribute('data-id', lite.meta.get('id'));
});

add(parseChunk(['<span >hello</span>']));
add(parseChunk(['<span> world</span>']));

end() // => <div><span>hello</span><span> world</span></div>