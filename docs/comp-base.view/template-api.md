# template registry
```typescript
export interface Template {
	node: LiteNode;
	actions: Action[];
}

export const templates = { 
	add (name: string, template: Template): void,
	get (name: string): Template,
	has (name: string): boolean
}

export const onAddTemplate: Event<(name: string, template: Template) => void>;
```
### `Template`
`Template`: is an object that represent a template of DOM tree.  
it is used to capture a DOM tree and reconstruct it when needed.    
it consists of:
- `node`: the top `LiteNode` that contains the content of the template.
- `actions`: an array that contains the actions gathered during creation.

each `LiteNode` has a unique id stored in `meta['neocomp:id']` of each node.

### `templates`
it is the global registry of `Template`s.

`add`: add the given `Template` to the registry.

`get`: returns the `Template` registered as `name`.

`has`: returns whether a `Template` is registered as the given `name`.

**builtin templates:**
- `empty`: an empty template of content `<div>`.

`onAddTemplate`: an event triggered when adding a `Template` to the registry

# template generation
```typescript
export const tempGen = {
	toDom (comp: AnyComp, template: Template): HTMLElement,
	generateFromDom (root: HTMLElement, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>)
	  : Template,
	generateFromLite (root: LiteNode, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>)
	  : Template,
	generateFromString (source: string, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>)
	  : Record<string, Template | Supplement>,
}

export interface Supplement {
	type: symbol
}
export interface Plugin {
	onSource?: (source: string, options: Partial<ParseOptions>) => void;
	onDom?: (root: HTMLElement) => void;
	onRoot?: (root: LiteNode) => void;
	onTemplate?: (template: Template) => void;
	onSupplement?: (name: string, top: LiteNode) => undefined | Supplement;
}

const defaultParseOptions: Partial<ParseOptions> = {
	attrStart: /^[^'"=`<>\s]/,
	attrRest: /^[^'"=`<>\s]+/,
	lowerAttr: false,
	lowerTag: false
}

export const onConvertTemplate: Event<(comp: PureComp, template: Template, el: HTMLElement) => void>;
```
`tempGen`: provides various functions to generate and convert `Template`.

## construction
`toDom`: construct a `HTMLElement` from a given `Template`, doesnt do actions.

`onConvertTemplate`: an event triggered when converting a `Template` into `HTMLElement`.

## generation
`generateFromDom`: generate a `Template` from a `HTMLElement`.

`generateFromLite`: generate a `Template` from a `LiteNode`.

`generateFromString`: generate a `Record` of `Template`s and `Supplement`s from a template file 
`source`.

these methods take an optional `Plugin[]` and `WalkOptions`.

## `Plugin`
the template generation can be customized using `Plugin`s, each `Plugin` can have the given hooks:
- `onDom`: called before generating a `Template` from a `HTMLElement`.
- `onSource`: called before generating a `Template` from a template file source, can overide
the `ParseOptions`.
- `onRoot`: called after generating `Template` root and before gathering actions.
- `onTemplate`: called after finishing generating a `Template`.
- `onSupplement`: called after encountering a supplement, if return a `Supplement`, stop calling
further hooks and pass the `Supplement` to the result content.

## template file
a template file is a HTML file where each top element represent an item named after its id and 
typed based on its tags.

a top element with tag `neo:template` represent a `Template`, where other tags represent 
`Supplement`.

`Supplement`s are defined by the `Plugin`s, it conatins the `type` of it plus any other 
properties it needs.

by default, template file attributes and tags are case conserved, and attribute names are more 
flexible as opposite to HTML.

# actions and walking
## actions
```typescript
export interface Action {
	type: string,
	target: number | HTMLElement,
	[unkown: string]: any
}

type Handler = (comp: PureComp, el: HTMLElement, action: Action) => void;
export function addAction (name: string, handler: Handler): void;

export function doActions (comp: AnyComp, actions: Action[]): void;

export function doActionsOfTemplate (
  comp: AnyComp, top: HTMLElement, liteTop: LiteNode, actions: Action[]
): void;
```
`Action`: is a lightweight storage unit that represent a custom logic for an element.

actions are gathered from the template source and stored for later execution when converting 
the templates.

they allow the definition of logic once on template generation and executing it effecintly on 
convertion later, also they allow serialization.

every `Action` contains a `type` and a `target` where it can be the live `HTMLElement` or the 
id of its `LiteNode` representation.

`addAction`: add a handler for a given action type, the handler is called with the `Component`, 
`HTMLElement` and the `Action`.

`doActions`: do the given `Action`s.

`doActionsOfTemplate`: do a given `Action`s from a `Template`, it requires the native and lite  form of the top element the actions defined for.

## walking
```typescript
export function walk (node: WalkNode, options: Partial<WalkOptions>): Action[];
export interface WalkOptions {
	serialize: boolean = false;
	inDom: boolean = false;
}

type Handler = (
  node: WalkNode, attr: string, value: string, actions: Action[], options: WalkOptions
) => void;
export function addActionAttr (name: string, handler: Handler): void;
```
walking is a mechanism where the DOM tree or the template is walked to gather the `Action`s.

it visits every element and search for action attributes or templated attributes.

`walk`: walk a given `WalkNode` and returns the gathered `Action`s, optionally takes `WalkOptions` 
which consists of:
- `serialize`: whether to store the `Action`s as serializable format, default `false`.
- `inDom`: whether walking is done in DOM, certain work arounds are activate if `true`, default 
`false`.

`addActionAttr`: add a handler for a given action attribute type, the handler is passed with the
`WalkNode`, attribute name and value, `Action`s and `WalkOptions`.

### walking api
```typescript
export type WalkNode = HTMLElement | LiteNode;

export const walkFns = {
	getTarget (node: WalkNode): number | HTMLElement,

	*attrsOf (node: WalkNode): Generator<[name: string, value: string]>,
	hasAttr (node: WalkNode, attr: string): boolean,
	getAttr (node: WalkNode, attr: string): string | undefined,
	setAttr (node: WalkNode, attr: string, value: string): void,
	removeAttr (node: WalkNode, attr: string): void,

	*childrenOf (node: WalkNode): Generator<WalkNode>,
	removeChildren (node: WalkNode): void,

	getText (node: WalkNode): string | undefined,
	setText (node: WalkNode, text: string): void,

	toFun (options: WalkOptions, args: string[], source: string): WalkFn,
	decodeAttrArg (value: string, options: WalkOptions): string
}

export type WalkFn = ((...args: any[]) => any) | SerializedFn;
export class SerializedFn {
	args: string[]; 
	source: string
	constructor (args: string[], source: string);
}
```
these functions provides utilities for action attributes handlers.

`WalkNode`: represent a node passed for action attribute handler as `walk` can work with native
DOM and `Template`.

`getTarget`: return the target of the given `WalkNode` to set to `Action.target`.

#### attributes utilities 
`attrsOf`: returns a `Generator` that iterates through a given `WalkNode` attributes.

`hasAttr`: returns whether a given `WalkNode` has the given attribute.

`getAttr`: gets an attribute from a given `WalkNode`, returns `undefined` if not found.

`setAttr`: sets an attribute from a given `WalkNode`.

`removeAttr`: removes an attribute from a given `WalkNode`.

#### content utilities
`childrenOf`: returns a `Generator` that iterates through the children of a given `WalkNode`.

`removeChildren`: remove all the children of a given `WalkNode`.

`getText`: returns the text of a given `WalkNode`, returns `undefined` if has child elements.

`setText`: set the text of a given `WalkNode`.

#### `WalkFn`
`toFun`: create a `WalkFn` from a given `args` and `source`, passed with `WalkOptions`.

`WalkFn`: it can be normal function if `options.serialize` is `false`, else `SerializedFn`.

`SerializedFn`: an `object` that represent a `function`.

-----
`decodeAttrArg`: provide a work around when walking in DOM as attributes names are changed to
lowercase, so uppercase is not possible.

when `options.inDom` is `true`, take a given `value` and replace all `-c` to `C` and every `--` 
to `-`.

## templated attributes
```typescript
export interface TAttrExp {
	isExp: true;
	fn: WalkFn
	dynamics: string[],
	statics: string[]
}
export interface TAttrProp {
	isExp: false;
	prop: string,
	static: boolean
}
export type TAttrPart = string | TAttrProp | TAttrExp;
export type TAttr = WalkFn | TAttrPart[];

export function parseTAttr (
  source: string, attr: string, options: WalkOptions, globalArgs: string[]
): TAttr;

export function evalTAttr (attr: TAttr, comp: AnyComp, el: HTMLElement, globalProps: any[]): any;
```
`parseTAttr`: parses a templated attribute, `attr` is the attribute name and `globalArgs` are 
arguments added to all functions.

`evalTAttr`: evalute a templated attribute and returns its value, `globalProps` are the global 
properties values.

`TAttr`: represent a templated attribute, it can be:
- `WalkFn`: in case of mono expression.
- `TAttrPart[]` where `TAttrPart` can be:
  - `string`: for literials.
  - `TAttrProp`: for properties accessor.
    - `prop`: peroperty name.
    - `static`: is static, only set not bind.
  - `TAttrExp`: for expressions.
    - `fn`: the expression as `WalkFn`.
	- `dynamics`: the dynamic properties binded.
	- `statics`: the static properties.