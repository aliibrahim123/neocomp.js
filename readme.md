# neocomp
bored of frameworks magic, want a lightweight solution for building scalable web apps and sites.

introducing **neocomp**, a lightweight, fast, and modern javascript web framework simplifying
web develepment without sacrificing maintainability or language identity.

it achieves this goal through fine grained reactivity, driven by imperative construction, with the use of chunked templating.

```typescript
class Counter extends Component {
	constructor () {
		super();
		const { $temp } = this.createTop();
		
		let count = this.signal(0);
		$temp`<button on:click=${() => count.value++}>count: ${count}</button>`;

		this.fireInit();
	}
}
```


# quick start
- [first steps](./docs/quick-guide/first-steps.md)
- [basic state management](./docs/quick-guide/basic-state.md)
- [templates](./docs/quick-guide/templates.md)

# docs
this is the index of the documentation.

- [rawdom](./docs/rawdom.md)
- **litedom:**
  - [core](./docs/litedom/core.md)
  - [parse](./docs/litedom/parse.md)
- [zro router](./docs/zro-router.md)
- **`comp-base` module:**
  - **core:**
    - [`Component`](./docs/comp-base.core/component.md)
    - [registry](./docs/comp-base.core/registry.md)
    - [general utilities](./docs/comp-base.core/utilities.md)
  - **state:**
    - [fundamentals](./docs/comp-base.state/fundamentals.md)
    - [`Store`](./docs/comp-base.state/store.md)
    - [state utilities](./docs/comp-base.state/utilities.md)
  - **view:**
    - [`View`](./docs/comp-base.view/view.md)
    - [chunk reference](./docs/comp-base.view/chunk.md)
- [vite plugin](./docs/plugin.md)
- [examples and patterns](./docs/examples.md)

# blogpost
check out the latest blogposts about neocomp at [recomputed](https://aliibrahim123.github.io/recomputed/web-dev).

---

thanks for selecting neocomp as your base framework, if you noticed issues or have ideas dont be
shy to share.  
`request(new Time() |> filter(!bug))`.
