# `View`
`View`: is the unit that connects the `Component` with the DOM.

it is responsible for the initial render and DOM managment. also it provides various utilities
for simplifing working with DOM.

## constructor and options
```typescript
export class View <Refs extends Record<string, HTMLElement | HTMLElement[]>, Chunks extends string> {
	constructor (comp: PureComp, el?: HTMLElement, options?: Partial<ViewOptions>);
	comp: PureComp;
	el: HTMLElement;
	options: ViewOptions;
	static defaults: ViewOptions;
}

export interface ViewOptions {
	defaultEl: (comp: PureComp) => HTMLElement;
	insertMode: InsertMode = 'atBottom';
	effectHost: boolean = true;
	liteConverters: Record<string, (lite: LiteNode) => Node> = {};
	removeEl: boolean = true;
}
type insertMode = 
	'asDefault' | 'replace' | 'atTop' | { type: 'into', target: string } | 'atBottom' | 'none';
```
`constructor`: take a component and optional element and `ViewOptions`.

`el`: the top element of the component, can be the passed host element, else the result of 
`options.defaultEl`.

`options`: is the view options defined for this view.

`defaults`: is the default options defined for all instances of the view.

### `ViewOptions` 
- `defaultEl`: a function that returns an element used as a top element if no element was 
passed during construction, defualt empty `<div>`.
- `insertMode`: control how the template is inserted to DOM, it can be:
  - `asDefault`: insert the template when there was no host element passed.
  - `replace`: insert the template and replace the host element content if any.
  - `atTop`: insert the template at the top of the host element.
  - `atBottom`: insert the template at the bottom of the host element, the default.
  - `{ type: 'into' }`: insert the template into the element matching `insertMode.target` in the
 host element.
  - `none`: doesnt insert the template.
- `effectHost`: whether to effect the host element on initial render, like transferring attributes 
from template root to it, default `true`.
- `liteConverters`: a record of functions used to convert litenodes of given tag name to
DOM nodes.
- `removeEl`: remove the top element when the component is removed, default `true`.

#### example
```typescript
class Example extends Component<TypeMap> {
	static defaults = {
		//...
		view: {
			// change default element into <span>
			defaultEl: () => document.createElement('span'),

			//replace host element content
			insertMode: 'replace',

			//insert into host > .slot-main
			insertMode: { type: 'into', target: '.slot-main' },

			// support mathml tag
			liteConverters: { math: (lite) => /* ... */ }

			// preserve host element on removal
			removeEl: false
		}
	}
}
```

## utilities
```typescript
export class View {
	query <T extends HTMLElement = HTMLElement> (selector: string): T[];

	refs: Record<keyof Refs, HTMLElement[]>;
	addRef <R extends keyof Refs> (name: R, el: Refs[R]): void;
}
```
`query`: return all elements in the top element that match the given selector.

`refs`: the references to elements created by [`@ref`](./template.md#ref) action attribute.

can be single html element or array from them depending on the type defined in `Refs`.

`addRef`: add the given element / elements as a reference, `el` can be html element or array of elements depending on the reference type.

#### example
```typescript
const sections = view.query('.section');

// <div @ref='sectionsConatiner'>...<section @ref='section[]'></section>...</div>
view.refs.sectionsContainer; // => <div>
view.refs.section; // => <section>[]

const title = constructOne('<div>title</div>');
view.el.append(title);
view.addRef('title', title);
```

## chunks
```typescript
export class View {
	constructChunk (name: Chunks | Template, context: Record<string, any> = {}): HTMLElement;
	getChunk (name: Chunks): Template;
}
```
chunks are templates that represent a chunk of DOM and are used for general use, other than the 
initial render.

`constructChunk`: construct a given chunk, it can be a defined chunk or a serialized template,
optional passed with a context used by the actions.

it contruct the template with its actions.

`getChunk`: get a chunk by name.

#### example
```typescript
class Example extends Component<TypeMap> {
	static chunks = {
		hello: $template('<div .text>hello $(){context.to}</div>')
	}
}
const comp = new Example();

comp.view.getChunk('hello'); // => <div .text>hello $(){context.to}</div>

comp.view.constructChunk('hello', { to: 'world' }); // => <div>hello world</div>
comp.view.constructChunk(
	$template('<a .href="{context.url}" .text>$(){context.text}</a>', 
	{ url: 'https://example.com', text: 'example' }
);
```

## walking and actions
```typescript
export class View {
	doActions (
		actions: Action[],  context: Record<string, any> = {},
		top: HTMLElement = this.el, lite?: LiteNode
	): void;
	onAction: Event<
		(view: this, top: HTMLElement, action: Action[], , context: Record<string, any>) => void
	>;
}
```
`doActions`: do the passed actions, can be passed with an optional top element and context 
(arguments to be passed to the actions).

if the actions are from a serialized template, must pass the top element and the lite node 
representing it.

`onAction`: an event triggered when doing actions.

#### example
```typescript
//case action from DOM
const actions = walk(someElement, { inDom: true });
view.doActions(actions, context, someElement);

//case action from template
view.doActions(template.actions, context, someElement, template.root);
```

## cleanup
```typescript
export class View {
	onCleanUp: Event<(view: this) => void>;
	cleanup (): void;
}
```
`cleanup`: clean up the dependencies on removed elements.

by default it removes all the effects that rely on elements removed from the DOM.   
to add this mechanism to your effects, add the element that the effect rely on in `meta.el` of 
the effect.

`onCleanUp`: an event triggered when requesting a cleanup.

#### example
```typescript
view.onCleanUp((view) => /* clean up for some custom system */);

store.addEffect('track', () => /* update some properties on an element */, undefined, undefined, { el: someElement });
someElement.remove();
view.cleanup(); //the effect added is removed
```

# template runtime
templates are units that represent an initial DOM structure with its actions and bindings.

it can be of two forms:
- as a source, see [template reference](./template.md).
- in serialized format: `Template`.

## `$template`
```typescript
export function $template (source: string): Template;
```
there are multiple ways to generate a `Template`, but the most common and recommended is through
`$template`.

`$template`: is a function that take a template source and produce a `Template`.

if the source correspond to a single top `neo:template` element, it will be the root of the 
`Template`.

it is exported through `comp-base/tempGen` module. if macro is enabled in the vite plugin, the static `$template` calls will be transformed to into serialized `Template`s at build time.

#### example
```typescript
class ExampleComp extends Component {
	static template = $template(`<div>hello</div>`)
}
```

## template registry
```typescript
export const templates = { 
	add (name: string, template: Template): void,
	get (name: string): Template,
	has (name: string): boolean
}

export const onAddTemplate: Event<(name: string, template: Template) => void>;
```
`templates` it is the global registry of the serialized templates.

`add`: add the given template to the registry.

`get`: returns the template registered as `name`.

`has`: returns whether a template is registered as the given name.

#### builtin templates
- `empty`: an empty template of content `<div>`.

`onAddTemplate`: an event triggered when adding a template to the registry.

#### example
```typescript
templates.add('hello', $template('<div>hello</div>'));

templates.has('hello'); // => true

class ExampleComp extends Component {
	static template = templates.get('hello');
}
```

## convertion to DOM
```typescript
export function templateToDom (
	comp: PureComp, template: Template, converters: Record<string, (lite: LiteNode) => Node> = {}
): HTMLElement;

export const onConvertTemplate: Event<(comp: PureComp, template: Template, el: HTMLElement) => void>;
```
`toDom`: construct a `HTMLElement` from a given serialized template, doesnt do actions.

optionally take converters that convert lite nodes of given tag name to DOM nodes.

`onConvertTemplate`: an event triggered when converting a template into HTML element.

#### example
```typescript
onConvertTemplate.add(() => console.log('converting template'));

templateToDom(comp, $template('<div>hello</div>')); // => <div>hello</div>

templateToDom(comp, $template('i love math: <math>...</math>'), {
	math (lite) { /* handle mathml */ }
});

templateToDom(comp, $template('<div>hello <span .text>$(){"world"}</span></div>')) 
	// => <div>hello <span></span></div>
```