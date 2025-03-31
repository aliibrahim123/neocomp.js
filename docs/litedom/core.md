# `litedom/core` module
this module is the main module of litedom, a lightweight DOM representation, it exports the
core classes and functions.

## `LiteNode` class
a class representing `HTMLElement` in a lightweight manner.

### constructor
```typescript
export class LiteNode {
	constructor (
  	  tag: string, attrs: Record<string, string | number | boolean | string[]> = {},
	  children: (string | LiteNode)[] = [], meta: Record<string, any> = {}
	);
}
```
construct a new `LiteNode` of specified tag, optionally take attributes, children and meta.

### properties
```typescript
export class LiteNode {
	tag: string;
	attrs: Map<string, string | number | boolean>;
	classList: Set<string>;
	children: (string | LiteNode)[];
	parent: LiteNode | undefined;
	meta: Map<string, any>;
}
```
`meta`: is a `Map` of user defined meta data.

### child and sibling related properties
```typescript
export class LiteNode {
	get childIndex (): number | undefined;
	get nextSibling (): LiteNode | string | undefined;
	get prevSibling (): LiteNode | string | undefined;
}
```
`childIndex`: returns the index of the node in its parent.

`nextSibling` and `prevSibling`: returns the respectful sibling of the node.

### child insertion methods
```typescript
export class LiteNode {
	append (...children: (LiteNode | string)[]): LiteNode;
	prepend (...children: (LiteNode | string)[]): LiteNode;
	insertAt (ind: number, ...children: (LiteNode | string)[]): LiteNode;
}
```
`append`: insert the passed children at the bottom.

`prepend`: insert the passed children at the top.

`insertAt`: insert the passend children at the specified index, index can be negative relative 
to the last child.

### siblings insertion methods
```typescript
export class LiteNode {
	before (...newSiblings: (LiteNode | string)[]): LiteNode;
	after (...newSiblings: (LiteNode | string)[]): LiteNode;
}
```
`before`: insert the given siblings before the node.

`after`: insert the given siblings after the node.

**note:** this functions fail silently if there is no parent.

### removing self methods
```typescript
export class LiteNode {
	remove (): LiteNode;
	replaceWith (node: LiteNode | string): LiteNode;
}
```
`remove`: remove the node from parent.

`replaceWith`: replace the node in parent with the given node.

**note:** this functions fail silently if there is no parent.

### removing children methods
```typescript
export class LiteNode {
	removeChild (ind: number): LiteNode;
	replaceChild (ind: number, child: LiteNode | string): LiteNode;
	removeChildren (): LiteNode
}
```
`removeChild`: remove the child at the given index.

`replaceChild`: replace the child at the given index with the given child.

**note:** this functions fail silently if there is no child at index.

`removeChildren`: remove all childrens from the node.

## nodes convertion functions
```typescript
export function liteToNative 
  (lite: LiteNode, converters: Record<string, (lite: LiteNode) => Node> = {}): HTMLElement;
export function nativeToLite (native: HTMLElement): LiteNode;
```
this functions convert between `HTMLElement` and `LiteNode`.

`liteToNative`: convert a `LiteNode` to `HTMLElement`.    
optionally take `converters`, a `Record` of functions used to convert `LiteNode`s of a given tag
name to `Node`s grouped by tag name.

`nativeToLite`: convert a `HTMLElement` to `LiteNode`.