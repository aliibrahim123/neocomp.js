# template generation
`comp-base/tempGen` is a module that exports various functions specilized in template generation.

### `Template`
```typescript
export interface Template {
	root: LiteNode;
	actions: Action[];
}
```
`Template`: are units that represent an initial DOM structure with its actions and bindings.

they are the serialized form of their source conterparts, and they are used throughout the 
framework.

they consists of:
- `root`: the root lite node that contains the content of the template, its tag is `neo:template`.
- `actions`: an array containing the actions gathered during generation.

each lite node has a unique id stored in `meta['neocomp:id']` of each node.

## generation functions
```typescript
export function generateFromDom (
	root: HTMLElement, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>
): Template;
export function generateFromLite (
	root: LiteNode, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>
): Template;
export function generateFromString (
	source: string, plugins: Plugin[] = [], walkOptions: Partial<WalkOptions> = {}
): Template;
export function generateFromSource (
	source: string, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>
): Record<string, Template | Supplement>;
```
`generateFromDom`: generate a serialized template from a html element.

`generateFromLite`: generate a serialized template from a lite node.

`generateFromString`: generate a serialized template from a string.   
if the top element is `neo:template`, it will be the root of the template, else the top elements 
will be children of an implicit root.

`generateFromSource`: generate a record of templates and supplements from a template file 
source.

these methods take an optional `Plugin`s and `WalkOptions`.

#### example
```typescript
const template = generateFromDom(constructOne('<div>hello</div>')); 
	// => Template { <div>hello</div> }

const template = generateFromLite(new LiteNode('div', {}, 'hello'));
	// => Template { <div>hello</div> }

const template = generateFromString('<div>hello</div>');
	// => Template { <div>hello</div> }

const templates = generateFromSource('<neo:template id="hello"><div>hallo</div></neo:template>');
	// => { hello: Template { <div>hallo</div> } }
```

## `Plugin`
```typescript
export interface Plugin {
	onSource?: (source: string, options: Partial<ParseOptions>, meta: Map<string, any>) => void;
	onDom?: (root: HTMLElement, meta: Map<string, any>) => void;
	onRoot?: (root: LiteNode, meta: Map<string, any>) => void;
	onTemplate?: (template: Template, meta: Map<string, any>) => void;
	onSupplement?: (name: string, node: LiteNode, meta: Map<string, any>) => undefined | Supplement;
}
```
the template generation can be customized using `Plugin`, each plugin can have the given hooks:
- `onDom`: called before generating a template from a html element.
- `onSource`: called before generating a template from a template file source, can overide
the parse options.
- `onRoot`: called after generating template root and before gathering actions.
- `onTemplate`: called after finishing generating a template.
- `onSupplement`: called after encountering a supplement, if it return a `Supplement`, stop calling
further hooks and pass the supplement to the result content.

these hooks are also called with a map for metadata shared across the whole process and all 
plugins.

## template file
```typescript
export interface Supplement {
	type: symbol
}

const defaultParseOptions: Partial<ParseOptions> = {
	rootTag: 'neo:template',
	tagStart: /^[^'"=`<>/\s]/,
	tagRest: /^[^'"=`<>/\s]+/,
	attrStart: /^[^'"=`<>\s]/,
	attrRest: /^[^'"=`<>\s]+/,
	lowerAttr: false,
	rawTextTags: new Set(['script', 'style', 'svg']),
	lowerTag: false
}
```
a template file is a HTML file where each top element represent an item named after its id and 
typed based on its tag.

a top element with tag `neo:template` represent a template, where other tags represent 
a supplement.

`Supplement`: are objects defined by the plugins, it conatins the type of it plus any other 
properties it needs.

#### example
```typescript
const metaSymbol = Symbol('neo:meta');
const Plugin: Plugin = {
	onSource (source, options) {
		options.keepWhiteSpaceTags = new Set([...options.keepWhiteSpaceTags, 'neo:meta'])
	}
	onSupplement (name, node) {
		if (name === 'neo:meta') return {
			type: metaSymbol, value: node.children[0]
		}
	}
}

generateFromSource(`
	<neo:meta id=title>hello</neo:meta>
	<neo:template id=template><div>hello</div></neo:template>
`, [Plugin]); // => {
//	template: Template { <div>hello</div> },
//	title: { type: metaSymbol, value: 'hello' }
// }
```

# actions and walking
## actions
```typescript
export interface Action {
	type: string,
	target: number | HTMLElement,
	[unkown: string]: any
}

type Handler = (comp: PureComp, el: HTMLElement, action: Action, context: Record<string, any>) => void;
export function addAction (name: string, handler: Handler): void;

export function doActionsFromDom (comp: PureComp, actions: Action[], context: Record<string, any> = {}): void;

export function doActionsOfTemplate (
  comp: PureComp, top: HTMLElement, liteTop: LiteNode, 
  actions: Action[], context: Record<string, any> = {}
): void;
```
`Action`: a lightweight serialized unit that represent a custom logic for an element.

actions are gathered from the elements of the template source and stored for later execution when 
converting the templates.

they allow the definition of logic once on template generation and executing it effecintly on 
construction later, also they allow serialization.

every action contains its type and a `target` where it can be the live html element or the 
`neo:id` of its lite node representation.

`addAction`: add a handler for a given action type, the handler is called with the component, 
target element, the action and the passed context (arguments passed to the action).

`doActionsFromDom`: do the given actions of elements in DOM.

`doActionsOfTemplate`: do the given actions of a serialzied template, it requires the native and 
lite form of the top element the actions defined for.

these functions take the host component and an optional context.

#### example
```typescript
const actions, el, template = // <div .text>hello $(){context.to}</div>

doActionsFromDom(comp, actions, { to: 'world' }); // => el: <div>hello world</div>

doActionsOfTemplate(comp, el, template.root, actions, { to: 'world' }); // => el: <div>hello world</div>

// define a log action
addAction('log', (comp, el, { value }) => console.log(value));
```

## walking
```typescript
export function walk (node: WalkNode, options: Partial<WalkOptions>): Action[];
export interface WalkOptions {
	serialize: boolean = false;
	inDom: boolean = false;
}
export function walkInDom (
	comp: PureComp, el: HTMLElement, context?: Record<string, any>, options: Partial<WalkOptions> = {}
): void;

type Handler = (
  node: WalkNode, attr: string, value: string, 
  addAction: (act: Action, defer?: boolean) => void, options: WalkOptions
) => void;
export function addActionAttr (name: string, handler: Handler): void;
```
walking is a mechanism where the DOM tree or the template is walked to gather the actions.

it visits every element and search for an action attributes or templated attributes.

`walk`: walk a given walk node and returns the gathered actions, optionally takes `WalkOptions` 
which consists of:
- `serialize`: whether to store the actions as serializable format, default `false`.
- `inDom`: whether walking is done in DOM, certain workarounds are activate if `true`, default 
`false`.

`walkInDom`: walk a given DOM element and execute the actions gathered.   
takes the host component and an optional context and walk options. 

`addActionAttr`: add a handler for a given action attribute type, the handler is passed with the
walk node the attribute defined on, the attribute name and value, `addAction` function and the 
walk options.

`addAction` is a function that add an action, added after `comp:this` action if `defer` is 
`true` (for actions that work with the child component)

#### example
```typescript
const node = // <div><span @ref=hallo>hello</span> <span .text>$(){context.to}</span></div>

walk (node, {
	inDom: true, // case node is html element
	serialize: true // case the actions will be saved in a javascript format
}); // => [ref, attr]

walkInDom(comp, node, { to: 'world' }); // => node: <div><span>hello</span> <span>world</span></div>

// define a @log=value action
addActionAttr('log', (node, attr, value, addAction) => {
	addAction({ type: 'log', taget: getTarget(node), value});
);
```

## walking api
```typescript
export type WalkNode = HTMLElement | LiteNode;

export function getTarget (node: WalkNode): number | HTMLElement;
```
these functions provides utilities for action attributes handlers.

walk mechanism can work with native DOM and lite nodes, and these functions provide an interface 
that works with both.

`WalkNode`: represent a node passed for action attribute handler.

`getTarget`: return the target of the given walk node for setting it to `Action.target`.

#### example
```typescript
action.target = getTarget(node);
```

### attributes utilities
```typescript
export function *attrsOf (node: WalkNode): Generator<[name: string, value: string]>;
export function hasAttr (node: WalkNode, attr: string): boolean;
export function getAttr (node: WalkNode, attr: string): string | undefined;
export function setAttr (node: WalkNode, attr: string, value: string): void;
export function removeAttr (node: WalkNode, attr: string): void;
export function toggleAttr (node: Node, attr: string, value: boolean): void;

export function addClass (node: Node, className: string): void;
export function removeClass (node: Node, className: string): void;
```
`attrsOf`: returns a `Generator` that iterates through a given walk node attributes.

`hasAttr`: returns whether a given walk node has the given attribute.

`getAttr`: gets an attribute from a given walk node, returns `undefined` if not found.

`setAttr`: sets an attribute from a given walk node.

`removeAttr`: removes an attribute from a given walk node.

`toggleAttr`: adds or remove an attribute from a given walk node based on a given value.

`addClass`: adds a class to a given walk node.

`removeClass`: removes a class from a given walk node.

#### example
```typescript
const node = // <div id=id>

hasAttr(node, 'id') // => true
getAttr(node, 'id') // => 'id'

setAttr(node, 'id', 'hallo') // => <div id=hallo>

removeAttr(node, 'id') // => <div>
getAttr(node, 'id') // => undefined

const input = // <input type=checkbox>
toggleAttr(input, 'checked', true) // => <input type=checkbox checked>
toggleAttr(input, 'checked', false) // => <input type=checkbox>

addClass(node, 'hallo') // => <div class=hallo>
removeClass(node, 'hallo') // => <div>

Array.from(attrsOf(/* <div id=a class=b> */)) // => [['id', 'a'], ['class', 'b']]
```

### content utilities
```typescript
export function *childrenOf (node: WalkNode): Generator<WalkNode>;
export function removeChildren (node: WalkNode): void;
	
export function getText (node: WalkNode): string | undefined;
export function setText (node: WalkNode, text: string): void;
```
`childrenOf`: returns a `Generator` that iterates through the children of a given walk node.

`removeChildren`: remove all the children of a given walk node.

`getText`: returns the text of a given walk node, returns `undefined` if has child elements.

`setText`: set the text of a given walk node, removes all the child elements.

#### example
```typescript
const node = // <div><span>hello</span> <span>world</span></div>
Array.from(childrenOf(node)) // => [span, span]

removeChildren(node) // => <div>

const node = // <div>hello</div>
getText(node) // => 'hello'
setText(node, 'hallo world') // => <div>hallo world</div>

const node = // <div>hallo <span>world</span></div>
getText(node) // => undefined
setText(node, 'hallo world') // => <div>hallo world</div>
```

### function serialization
```typescript
export function toFun (options: WalkOptions, args: string[], source: string): (...args: any[]) => any | SerializedFn;
export class SerializedFn {
	args: string[]; 
	source: string
	constructor (args: string[], source: string);
}
```
`toFun`: create a function from a source, respecting serialization.

it returns `SerializedFn` if `options.serialize` is `true`, otherwise returns a normal function.

`SerializedFn`: an object that represent a serialized function, it is convert to a normal function 
at bundle time.

#### example
```typescript
const fn = toFun({ serialize: false }, ['a', 'b'], 'return a + b'); // => (a, b) => a + b

const fn = toFun({ serialize: true }, ['a', 'b'], 'return a + b'); 
	// => SerializedFn { args: ['a', 'b'], source: 'return a + b' }
```

### other utilities
```typescript
export function decodeAttrArg (value: string, options: WalkOptions): string
```
`decodeAttrArg`: provide a work around when walking in DOM as attributes names are changed to
lowercase, so uppercase is not possible.

when `options.inDom` is `true`, replace all `-c` to `C` and every `--` to `-` in the given value.

#### example
```typescript
decodeAttrArg('hallo--to-world', { inDom: false }) // => 'hallo--to-world'
decodeAttrArg('hallo--to-world', { inDom: true }) // => 'hallo-toWorld'
```

## templated attributes
```typescript
export interface TAttrExp {
	isExp: true,
	fn: (...args) => any,
	dynamics: string[],
	statics: string[]
}
export interface TAttrProp {
	isExp: false,
	prop: string,
	static: boolean
}
export type TAttrPart = string | TAttrProp | TAttrExp;
export type TAttr = (...args) => any | TAttrPart[];

export function parseTAttr (
  source: string, attr: string, options: WalkOptions, globalArgs: string[]
): TAttr;

export function evalTAttr (
	attr: TAttr, comp: PureComp, el: HTMLElement, context: Record<string, any>, props: any[]
): any;
```
templated attributes are computed attributes that are evaluated at runtime.

for syntax see [template attributes source](./template.md#templated-attributes).

`parseTAttr`: parses a templated attribute.   
takes the source, attribute name, walk options and global arguments (arguments added to all 
functions).

`evalTAttr`: evalute a templated attribute and returns its value.

it assumes that the attribute has the general inputs like other neocomp templated attributes, so global arguments are supposed to be 
`(comp: PureComp, el: HTMLElement, context: Record<string, any>, ...props: any[])` taking the component, the element, the context and the global properties.

`TAttr`: represent a serialized templated attribute, it can be:
- `function`: in case of mono expression.
- array of `TAttrPart` where `TAttrPart` can be:
  - `string`: for literials.
  - `TAttrProp`: for properties accessor (`#{prop}` / `@{prop}`).
    - `prop`: the peroperty name.
    - `static`: is static, only set not bind.
  - `TAttrExp`: for expressions (`$(props){exp}` / `@(props){exp}`).
    - `fn`: the expression as `WalkFn`.
	- `dynamics`: the dynamic properties binded.
	- `statics`: the static properties.

the constant expressions (`#{exp}`) and escape codes (`\...`) are converted into string literals.

#### example
```typescript
const attr = parseTAttr('hallo @{to}', 'example', options, []);
	// => ['hallo', { isExp: false, prop: 'to', static: false }]

comp.set('to', 'world');
evalTAttr(attr, comp, el, {}, []); // => 'hallo world'
```