# the prerequisites
while neocomp has low learning curve, it requires:

- solid understanding of [web technologies](https://developer.mozilla.org/en-US/docs/Web).
- [node](https://nodejs.org) / [npm](http://npmjs.org) installed.
- *optionally* [typescript](https://www.typescriptlang.org) for strong typing.
- *optionally* [vite](https://vitejs.dev) for better development.

neocomp is built around flexibility, it has no dependencies only existing. but it is good idea to have comfortable development environment before beginning.

# installation
after having a ready normal npm project, type into the terminal.

```bash
npm install @neocomp/full
```

and you are good to go.

### using vite
neocomp provide a [vite plugin](../plugin.md) for build time template generation. it is possible to generate the templates at runtime, but using the plugin reduce the bundle size and first load time.

to use the plugin, add this to your vite config.

```typescript
import { neoTempPlugin } from "@neocomp/full/build";

export default {
  //...
  plugins: [neoTempPlugin()],
};
```

# defining components
component are the base unit in neocomp, each component represent a reusable user interface unit. each component encapsulate its own state and logic.

the base boliplate for any component:

```typescript
import { Component, registry } from "@neocomp/full/comp-base";

// a class that contains the component logic
class ExampleComponent extends Component {
	constructor (el) {
		super();

		// construct the dom structure
		const { $temp } = this.createTop();
		$temp`<div></div>`;

		// notify the outside world
		this.fireInit();
	}
}

// optional, register the component to be used in different system by name
registry.add('example', ExampleComponent);
```

# integrating neocomp
neocomp components can be used freely as independent units. but if used as the base of a site, they must start from a common root.

that root is called the root component, and it is registered through.

```typescript
import { registry } from "@neocomp/full/comp-base";

registry.setRoot(new RootComponent(rootElement));
```

where `rootElement` is the root element of the page

-----
next step: [basic state](./basic-state.md)