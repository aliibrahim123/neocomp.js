# neocomp
**neocomp** is a lightweight, reactive UI framework for the web platform.

It favors simplicity and efficiency over complex abstractions, providing ergonomic and expressive UI declarations with direct, efficient reactivity and zero runtime or build-time overhead.

It is powered by fine-grained reactivity, driven by imperative construction, and features a unique approach to templating called chunked templating.

## Example
```ts
html`
	<h1>hello world</h1>
	<${() => {
		let count = signal(0);
		html`<button on:click=${() => count.value++}>count: ${count}</button>`;
	}}>
`;
```

# Quick Start
Add `@neocomp/core` to your project: `npm install @neocomp/core`.

Add this simple initialization boilerplate to your `index.ts`:
```ts
import '@neocomp/core/enable_chunk_parsing';
import { Context } from '@neocomp/core';

let ctx = new Context(document.querySelector('#main'));
let { html, signal, effect, computed } = ctx.root_chunk();
```

The code above creates a UI `Context` (the root of the UI), initializes a root chunk, and extracts the core APIs (`html`, `signal`, `effect`, and `computed`) from it.

### Reactivity
Similar to SolidJS, neocomp uses fine-grained reactivity to provide efficient updates to the UI.

Reactive state is created using the `signal` function, which accepts an initial value and returns a `Signal` object.

A `Signal` is an object that wraps a reactive value, which can be accessed and updated through its `value` property.

```ts
let count = signal(1);
console.log(count.value); // => 1
count.value += 1;
console.log(count.value); // => 2
```

Reactive side effects are created using the `effect` function. Each time a `Signal` value read within an effect changes, the effect automatically re-runs.

```ts
let count = signal(1);
effect(() => console.log("count: ", count.value)); // => count: 1
count.value += 1;
// => count: 2
```

The `computed` function creates a reactive value derived from other reactive states.

```ts
let count = signal(1);
let double = computed(() => count.value * 2);
console.log(double.value); // => 2
count.value += 1;
console.log(double.value); // => 4
```

### Templating
The UI in neocomp is constructed at initialization, and following updates flow directly to the target elements through fine-grained reactivity.

neocomp uses a Lit-inspired templating system based on the `html` tagged template. However, it introduces a unique approach called chunked templating.

Instead of defining the UI as a big blob at the end of a component, UI is composed of multiple chunks. This allows you to interleave the UI and its logic within the same function.

Furthermore, a block of code can be inserted and evaluated at any point inside a chunk. This block can construct nested chunks inline, allowing you to localize the UI and its logic at any level.

```ts
let shared = signal("shared");
html`
	<div><${() => {
		html`<h1>section 1</h1>`;

		let count = signal(0);
		html`<button on:click=${() => count.value++}>count: ${count}</button>`;

		html`<input on:input=${(e) => shared.value = e.target.value}>`;
	}}></div>

	<div><${() => {
		html`<h1>section 2</h1>`;

		html`<p>shared: ${shared}</p>`;
	}}></div>
`;
```

Any standard control flow or imperative pattern can be used during chunk construction. though they are static rather than dynamic, there are no components, only functions that accept a `ChunkBuild`.

```ts
function counter(build: ChunkBuild, name: string) {
	let count = build.signal(0);
	build.html`<button on:click=${() => count.value++}>${name}: ${count}</button>`;
}

let build = ctx.root_chunk();

for (let i = 0; i < 10; i++) {
	counter(build, `counter ${i}`);
	if (i % 5 === 4) build.html`<br>`;
}
```

Bindings are defined using placeholders (`${}`) and can be used for either attribute values or text content. Static values are evaluated at initialization, while signals are bound dynamically. Computed expressions can be defined inline using closures.

The `class:name` syntax binds classes, `style:name` binds CSS properties, and `on:name` registers event listeners.

```ts
let id = 'my-id';
let active = signal(false);
html`<button id=${id} class:active=${active} on:click=${() => active.value = !active.value}>
	i am ${() => active.value ? 'active' : 'inactive'}
</button>`;
```

Dynamic conditional rendering and list rendering are handled using the `show_if` and `render_list` functions.

```ts
let active = signal(false);
html`<div><${show_if(active)}>content</div>`

let list = signal([1, 2, 3]);
html`<ul><${render_list(list, null, 'li', (build, item) => build.html`${item}`)}></ul>`;
```