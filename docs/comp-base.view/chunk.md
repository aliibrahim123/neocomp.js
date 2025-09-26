# chunks
```typescript
let count = comp.signal(0);
$temp`<button on:click=${() => count.value++}>count: ${count}</button>`;
```
ui in neocomp is defined through chunks, chunks are fragments of html structure that are defined between logic, each chunk can be split into multiple sections at any point, and can have their logic around them.

this approach is opposite to what other frameworks do, where the entire structure is defined at the end.

chunks enable the definition of the structure in flixible manner, inlined within its logic, in reqular javascript syntax without the use of any kind of abstractions.

```typescript
$temp`<div>some ${'content'}$</div>`;

// splitable where your want
$temp`<div`;
$temp`id=someId`;
$temp`>some `;
$temp`content</div>`;

if (someCond) $temp`<div>conditional content</div>`;

// list rendering
for (let i = 0; i < 10; i++) $temp`<div>${i}</div>`;

// functions
function counter (name: string) {
	let count = comp.signal(0);
	$temp`<button on:click=${() => count.value++}>${name}: ${count}</button>`
}
counter('a');
counter('b');

// encapsulated section
$temp`<section id=counter>`;{
	let count = comp.signal(0);
	$temp`<button on:click=${() => count.value++}>count: ${count}</button>`
};$temp`</section>`;
```

## placehoders
```typescript
$temp`<div>${'it is me'}</div>`
```
placeholders are embedded expressions defined through `${exp}` in template literals, they are arguments passed to the `$temp` function.

most placeholder accept normal values and apply it as static, they also accept signals and computed expressions for dynamic binding.

**computed expressions**: are passed as functions that gets rerun when the properties they use change, called with `(el: HTMLElement, comp: Component) => any`.

placeholders can be of the following types:

### attribute placeholders
```typescript
$temp`<div id=${'id'}>`;
```
attribute placeholders are placed as an attribute value after `=`, they target specific attributes and set / bind there evaluated value to them.

attribute placeholders accept the following values:
- strings as a static value.
- boolean that the attribute is toggled based on it.
- `null` and `undefined` then the attribute is not set.
- signals and computed expressions that get binded to the attribute value.
- any other value is stringified.

```typescript
$temp`<div id=${'id'}>`;
$temp`<input type=checkbox checked=${true}>`;
$temp`<img alt=${alt || null}>`;
$temp`<img width=${150}>`;
let width = comp.signal(150);
$temp`<img width=${width}>`;
$temp`<img height=${() => width.value / 2}>`;
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
$temp`<div class:active=${true}>`;
$temp`<div style:color=${color}>`;
$temp`<div .innerHTML=${source}>`;
$temp`<div on:click=${() => console.log('clicked')}>`;
$temp`<div class=${{ active: true, primary: true }}>`;
$temp`<div style=${{ color, fontSize: '20px' }}>`;
```

### action placeholders
```typescript
$temp`<div ${action}>`
```
action placeholders are placed between the attributes of an element, they take functions that get called with the element when it is created, after its children.

additionally, they also accept a map of attributes and inputs of attribute placeholders that get applied to the specified attributes.

```typescript
$temp`<div ${el => el.animate(/* ... */)}>animate on creation</div>`
$temp`<div ${el => this.someEl = el}>store a reference to the element</div>`
$temp`<div ${{ id: 'id', class: { active: () => !disabled.value } }}}>`
```

### content placeholders
```typescript
$temp`<div>${'it is me'}</div>`
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
$temp`<div>hallo ${'world'}</div>`;
$temp`<div>${someEl}</div>`;
$temp`<div>${new SomeComp}</div>`;
$temp`<div>${null}</div>`; // => <div></div>
$temp`<div>${15}</div>`;
$temp`<div>${someEl.children}</div>`;
$temp`<div>${text}</div>`;
$temp`<div>${() => text.value || 'no content'}</div>`;
```

## chunk unititles
```typescript
type ActionFn = (el: HTMLElement, comp: Component) => void;
export function defer (fn: ActionFn): ActionFn;
export function wrapWith (comp: ConstructorFor<Component>, ...args: any): ActionFn;
export function $async (comp: Component, builder:
	(build: ChunkBuild, fallback: (el: HTMLElement) => void) => Promise<void>
): HTMLElement;
```
utitlies for creating chunks.

`defer`: add a function that gets called when the target element is fully created.

`wrapWith`: add a component that gets mounted into the target element, accept the component class and its arguments.

`$async`: creates an async chunk, it initially return a fallback and waits to the async builder to finish, then it replace the fallback with the result.

fallback must be called before any async stuff.

#### example
```typescript
$temp`<div>${defer(() => console.log('element fully created'))}`;
$temp`<span>content 1</span>`;
$temp`<span>content 2</span>`;
$temp`<span>content 3</span>`;
$temp`</div>`; // => element fully created

$temp`<div ${wrapWith(Comp, 'someValue')}>`;

$temp`${async ({ $temp }, fallback) => {
	fallback(comp.$chunk`<span>wait</span>`);
	await new Promise(resolve => setTimeout(resolve, 1000));
	$temp`<span>content 1</span>`;
	await new Promise(resolve => setTimeout(resolve, 1000));
	$temp`<span>content 2</span>`; 
	// fallback get replaced by <div><span>content 1</span><span>content 2</span></div>
}}`;
```

## chunks build
```typescript
export interface ChunkBuild {
	add: (chunk: ParsedChunk, args: ChunkInp[]) => void;
	$temp: (parts: TemplateStringsArray, ...args: ChunkInp[]) => void;
	$ensure: (cond: "in_attrs" | "in_content") => void;
	end: () => HTMLElement;
}

export function createChunk (
	comp: Component, el?: HTMLElement, liteConverters: Record<string, (lite: LiteNode) => Node> = {}
): ChunkBuild;
export function parseChunk (parts: string[], state?: ParseState): ParsedChunk;
```
`ChunkBuild`s are objects used in chunks construction, they conatins the methods used when building a chunk and are returned by functions that create chunks, like `view.createChunk` and `Component.chunk`.

`$temp`: add a new section to the chunk, it is a tagged template function that take a template literal of html structure format, with arguments passed as embedded expressions.

`$temp` can be optimized at build time by [neoTempPlugin](../plugin.md) into an efficient form, this eliminate the cost of parsing the template at runtime.

`$temp` arguments are cached at first call, so subsequent calls will not have any additional cost.

`add`: add a new section to the chunk, this is a low level function that take the parsed form of chunks (`ParsedChunk`), and also an array of arguments.

`end`: end the chunk build and return the root element of the chunk.

if there is only one element in root in case no root element is given, it is returned directly.

`$ensure`: assert the given condition is true, case macro transformation is enabled, it act as a hint to the transformer.

**conditions**: 
- `in_attrs`: the current position is in the attributes section of an element.
- `in_content`: the current position is in the content section of an element. 

`createChunk`: create a new chunk build, takes the host component, optionally a root element, and a map of lite to native nodes converters mapped by tag name.

`parseChunk`: parse a chunk from parts into a `ParsedChunk`, optionally take the last parse state.

**note**: runtime chunk parsing can be disabled by setting `globalThis.__neocomp_disable_chunk_parsing` to `true` before importing neocomp.

#### example
```typescript
let { add, $temp, $ensure, end } = createChunk(comp);

$temp`<section>`;
$temp`<div>the standared ${'way'}</div>`; // => <div>the standared way</div>

// optimized from the first call
for (let i = 0; i < 10; i++) $temp`<div>${i}</div>`;

$temp`<div>sadly caching this doesnt work, must be the same callsite</div>`;
$temp`<div>sadly caching this doesnt work, must be the same callsite</div>`;

let parsed = parseChunk(['<div>the optimized ', '</div>']);
add(parsed, ['way']); // => <div>the optimized way</div>

// this functions will cause errors at build time without hints, as the transformater thing that it is in content based on the previous code.
function addAttrs () {
	$ensure('in_attrs');
	$temp`some-attr`;
}
$ensure('in_content');

// finished building
$temp`</section>`;
let chunk = end(); // => <section> ... </section>

let { $temp, add } = createChunk(comp, chunk);
// added content to the prev chunk
$temp`<div>other content</div>`;
end();

// in some bootstrap module
// force all chunks to be parsed at build time, error if some didnt get caught by the transformer
globalThis.__neocomp_disable_chunk_parsing = true; 
```