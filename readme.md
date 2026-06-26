# neocomp
neocomp is a lightweight reactive ui framework for the web platform.

it favors lightweightness and effeciency over heavy dark magic, providing an ergonomic and expressive ui declerations with effecient direct reactivity without any runtime or buildtime overhead.

it is powered by fine grained reactivity, and driven by imperative construction, and features a unique way of templating called chunked templating.

## example
```ts
html`
	<h1>hello world</h1>
	<${() => {
		let count = signal(0);
		html`<button on:click=${() => count.value++}>count: ${count}</button>`;
	}}>
`;
```

# quick start
add `@neocomp/core` to your `package.json`: `npm install @neocomp/core`.

add this simple init boilerplate to your `index.ts`:
```ts
import '@neocomp/core/enable_chunk_parsing';
import { Context } from '@neocomp/core';

let ctx = new Context(document.querySelector('#main'));
let { html, signal, effect, computed } = ctx.root_chunk();
```

the above code creates a ui `Context`, the root of the ui, create a root chunk and extract the main apis (`html`, `signal`, `effect`, `computed`) from it.

### reactivity
like solidjs, neocomp uses fine grained reactivity to provide effecient reactivity to the ui.

reactive states are created using the `signal` function, taking the initial value, and returning a `Signal` object.

`Signal`s are objects that wraps a reactive value, which can be accessed through the `value` property.

```ts
let count = signal(1);
console.log(count.value); // => 1
count.value += 1;
console.log(count.value); // => 2
```

reactive snippets of code are called effects and are created though the `effect` function.

each time the value of a `Signal` readed by an effect changes, the effect is reexecuted.

```ts
let count = signal(1);
effect(() => console.log("count: ", count.value)); // => count: 1
count.value += 1;
// => count: 2
```

`computed` creates a reactive property that is derived from other reactive properties.

```ts
let count = signal(1);
let double = computed(() => count.value * 2);
console.log(double.value); // => 2
count.value += 1;
console.log(double.value); // => 4
```

### templating
the ui in neocomp is constructed at init time and further updates flow directly to the required locations through fined grained reactivity.

neocomp uses a `lit` inspired templating system using the `html` tagged template, however it features a unique approach of templating called chunked templating.

instead of creating ui as a big blob at the end of components, ui in neocomp is composed of multiple chunks, allowing to interleave ui and its own logic in the same function.

also at any point inside the chunk, a code of block can be inserted and evaluated at that point, that block can futher construct nested chunks at that it, allowing to localize the ui and its logic at any level.

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

any control flow and imperative pattern can be used in chunks construction, though they are static not dynamic, there are no components, just functions that borrow the `ChunkBuild`.

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

bindings are defined using placeholders (`${}`) and can be placed as attribute values or content, static values are set at init time and signals are binded dynamically, computed expressions are defined inside clojues.

`class:name` attributes bind classes, `style:name` attributes bind css properties, and `on:name` attributes add event listeners.

```ts
let id = 'my-id';
let active = signal(false);
html`<button id=${id} class:active=${active} on:click=${() => active.value = !active.value}>
	i am ${() => active.value ? 'active' : 'inactive'}
</button>`;
```

dynamic conditional and list rendering is done using `show_id` and `render_list` functions.
```ts
let active = signal(false);
html`<div><${show_if(active)}>content</div>`

let list = signal([1, 2, 3]);
html`<ul><${render_list(list, null, 'li', (build, item) => build.html`${item}`)}></ul>`;
```