# chunks
```typescript
let count = comp.signal(0);
html`<button on:click=${() => count.value++}>count: ${count}</button>`;
```
ui in neocomp is defined through chunks, chunks are fragments of html structure that are defined between logic, each chunk can be split into multiple sections at any point, and can have their logic around them.

this approach is opposite to what other frameworks do, where the entire structure is defined at the end.

chunks enable the definition of the structure in flixible manner, inlined within its logic, in reqular javascript syntax without the use of any kind of abstractions.

```typescript
html`<div>some ${'content'}$</div>`;

// splitable where your want
html`<div`;
html`id=someId`;
html`>some `;
html`content</div>`;

if (someCond) html`<div>conditional content</div>`;

// list rendering
for (let i = 0; i < 10; i++) html`<div>${i}</div>`;

// functions
function counter (name: string) {
	let count = comp.signal(0);
	html`<button on:click=${() => count.value++}>${name}: ${count}</button>`
}
counter('a');
counter('b');

// encapsulated section
html`<section id=counter>`;{
	let count = comp.signal(0);
	html`<button on:click=${() => count.value++}>count: ${count}</button>`
};html`</section>`;
```

## placehoders
```typescript
html`<div>${'it is me'}</div>`
```
placeholders are embedded expressions defined through `${exp}` in template literals, they are arguments passed to the `html` function.

most placeholder accept normal values and apply it as static, they also accept signals and computed expressions for dynamic binding.

**computed expressions**: are passed as functions that gets rerun when the properties they use change, called with `(el: HTMLElement, comp: Component) => any`.

placeholders can be of the following types:

### attribute placeholders
```typescript
html`<div id=${'id'}>`;
```
attribute placeholders are placed as an attribute value after `=`, they target specific attributes and set / bind there evaluated value to them.

attribute placeholders accept the following values:
- strings as a static value.
- boolean that the attribute is toggled based on it.
- `null` and `undefined` then the attribute is not set.
- signals and computed expressions that get binded to the attribute value.
- any other value is stringified.

```typescript
html`<div id=${'id'}>`;
html`<input type=checkbox checked=${true}>`;
html`<img alt=${alt || null}>`;
html`<img width=${150}>`;
let width = comp.signal(150);
html`<img width=${width}>`;
html`<img height=${() => width.value / 2}>`;
```

attribute placeholder can target other kinds of properties of elements based on the attribute name:
- `class:name`: toggle a class of `name` based on the truthness of the evaluted value.
- `style:prop`: target a style property named `prop`.
- `.prop`: target a property named `prop` on the target element.     
**note:** placeholders of these target accept the same values as normal attribute placeholders.
- `on:event`: add a function as an event listener for event type `event`. 
- `class`: accept an object of class names and inputs of `class:name` placeholders and apply them to the specified class names.
- `style`: accept an object of style properties and inputs of `style:prop` placeholders and apply them to the specified properties.

```typescript
let color = comp.signal('red');
html`<div class:active=${true}>`;
html`<div style:color=${color}>`;
html`<div .innerHTML=${source}>`;
html`<div on:click=${() => console.log('clicked')}>`;
html`<div class=${{ active: true, primary: true }}>`;
html`<div style=${{ color, fontSize: '20px' }}>`;
```

### action placeholders
```typescript
html`<div ${action}>`
```
action placeholders are placed between the attributes of an element, they take functions that get called with the element when it is created, after its children.

additionally, they also accept a map of attributes and inputs of attribute placeholders that get applied to the specified attributes.

```typescript
html`<div ${el => el.animate(/* ... */)}>animate on creation</div>`
html`<div ${el => this.someEl = el}>store a reference to the element</div>`
html`<div ${{ id: 'id', class: { active: () => !disabled.value } }}>`
```

### content placeholders
```typescript
html`<div>${'it is me'}</div>`
```
content placeholders are placed as content of an element, they insert the evaluated value as content at their place inside the element.

content placeholders accept the following values:
- strings that get inserted as text, support white space.
- `Node` that get inserted into the DOM.
- `Component` that get mounted into the DOM, and added to the component.
- `null` and `undefined` that get ignored.
- `ArrayLike<Node>` that get inserted into the DOM.
- signals and computed expressions that get binded, there value replaces the old content.
- any other value is stringified and inserted as text.     
**note**: signals and computed expressions accept any value except array of nodes, string inside them are inserted inside a `<span>`.

```typescript
let text = comp.signal('some content');
html`<div>hallo ${'world'}</div>`;
html`<div>${someEl}</div>`;
html`<div>${new SomeComp}</div>`;
html`<div>${null}</div>`; // => <div></div>
html`<div>${15}</div>`;
html`<div>${someEl.children}</div>`;
html`<div>${text}</div>`;
html`<div>${() => text.value || 'no content'}</div>`;
```

## chunk unititles
```typescript
type ActionFn = (el: HTMLElement, comp: Component) => void;
export function defer (fn: ActionFn): ActionFn;
export function snippet (builder: (build: ChunkBuild, comp: Component) => void): 
	(el: HTMLElement, comp: Component) => HTMLElement;
export function showIf (value: Signal<boolean> | (el: HTMLElement, comp: Component) => boolean): ActionFn;
export function wrapWith (comp: ConstructorFor<Component>, ...args: any): ActionFn;
export function $async (comp: Component, builder:
	(build: ChunkBuild, fallback: (el: HTMLElement) => void) => Promise<void>
): HTMLElement;
export function renderList<T> (
	signal: Signal<T[]>,
	builder: (build: ChunkBuild, item: T, index: number | Signal<number>) => void,
	dynIndex?: boolean
): ActionFn;
```
utitlies for creating chunks.

`defer`: add a function that gets called when the target element is fully created.

`snippet`: create reusable external chunk given a builder.

`showIf`: show an element based on a reactive value (a signal or a computed expression).

`wrapWith`: add a component that gets mounted into the target element, accept the component class and its arguments.

`$async`: creates an async chunk, it initially return a fallback and waits to the async builder to finish, then it replace the fallback with the result.

fallback must be called before any async stuff.

`renderList`: render a dynamic list, it accepts a signal of the list and a `builder` that gets called for each item of the list.

if `dynIndex` is `true`, `builder` is given a signal that relfect the index of the item.

every item associated with the items chunks will be removed when the item is removed.

#### example
```typescript
html`<div>${defer(() => console.log('element fully created'))}`;
html`<span>content 1</span>`;
html`<span>content 2</span>`;
html`<span>content 3</span>`;
html`</div>`; // => element fully created

let counter = (name) => snippet(({ html }, comp) => {
	let count = comp.signal(0);
	html`<button on:click=${() => count += 1}>${name}: ${count}</button>`;
})

html`${counter('counter 1')}`;
html`${counter('counter 2')}`;

html`<div ${showIf(active)}>`;

html`<div ${wrapWith(Comp, 'someValue')}>`;

html`${async ({ html }, fallback) => {
	fallback(comp.$chunk`<span>wait</span>`);
	await new Promise(resolve => setTimeout(resolve, 1000));
	html`<span>content 1</span>`;
	await new Promise(resolve => setTimeout(resolve, 1000));
	html`<span>content 2</span>`; 
	// fallback get replaced by <div><span>content 1</span><span>content 2</span></div>
}}`;

let items = comp.signal([1, 2, 3]);
html`<div ${renderList(items, ({ html }, item, index) => {
	html`<div>${item} at ${index}`;
	html`${new SomeComp(item)}`; // removed when item is removed
	html`</div>`;
}, true)}/>`;
```

## chunks build
```typescript
export interface ChunkBuild {
	add: (chunk: ParsedChunk, args: ChunkInp[]) => void;
	html: (parts: TemplateStringsArray, ...args: ChunkInp[]) => void;
	ensure: (cond: "in_attrs" | "in_content") => void;
	end: () => HTMLElement;
}

export function createChunk (
	comp: Component, el?: HTMLElement, liteConverters: Record<string, (lite: LiteNode) => Node> = {}
): ChunkBuild;
export function parseChunk (parts: string[], state?: ParseState): ParsedChunk;
```
`ChunkBuild`s are objects used in chunks construction, they conatins the methods used when building a chunk and are returned by functions that create chunks, like `view.createChunk` and `Component.chunk`.

`html`: add a new section to the chunk, it is a tagged template function that take a template literal of html structure format, with arguments passed as embedded expressions.

`html` can be optimized at build time by [neoTempPlugin](../plugin.md) into an efficient form, this eliminate the cost of parsing the template at runtime.

`html` arguments are cached at first call, so subsequent calls will not have any additional cost.

`add`: add a new section to the chunk, this is a low level function that take the parsed form of chunks (`ParsedChunk`), and also an array of arguments.

`end`: end the chunk build and return the root element of the chunk.

if there is only one element in root in case no root element is given, it is returned directly.

`ensure`: assert the given condition is true, case macro transformation is enabled, it act as a hint to the transformer.

**conditions**: 
- `in_attrs`: the current position is in the attributes section of an element.
- `in_content`: the current position is in the content section of an element. 

`createChunk`: create a new chunk build, takes the host component, optionally a root element, and a map of lite to native nodes converters mapped by tag name.

`parseChunk`: parse a chunk from parts into a `ParsedChunk`, optionally take the last parse state.

**note**: runtime chunk parsing can be disabled by setting `globalThis.__neocomp_disable_chunk_parsing` to `true` before importing neocomp.

#### example
```typescript
let { add, html, ensure, end } = createChunk(comp);

html`<section>`;
html`<div>the standared ${'way'}</div>`; // => <div>the standared way</div>

// optimized from the first call
for (let i = 0; i < 10; i++) html`<div>${i}</div>`;

html`<div>sadly caching this doesnt work, must be the same callsite</div>`;
html`<div>sadly caching this doesnt work, must be the same callsite</div>`;

let parsed = parseChunk(['<div>the optimized ', '</div>']);
add(parsed, ['way']); // => <div>the optimized way</div>

// this functions will cause errors at build time without hints, as the transformater thing that it is in content based on the previous code.
function addAttrs () {
	ensure('in_attrs');
	html`some-attr`;
}
ensure('in_content');

// finished building
html`</section>`;
let chunk = end(); // => <section> ... </section>

let { html, add } = createChunk(comp, chunk);
// added content to the prev chunk
html`<div>other content</div>`;
end();

// in some bootstrap module
// force all chunks to be parsed at build time, error if some didnt get caught by the transformer
globalThis.__neocomp_disable_chunk_parsing = true; 
```