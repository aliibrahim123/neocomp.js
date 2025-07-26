# the prerequisites
while neocomp has low learning curve, it requires:
- solid understanding of [web technologies](https://developer.mozilla.org/en-US/docs/Web).
- [node](https://nodejs.org) / [npm](http://npmjs.org) installed.
- *optionally* [typescript](https://www.typescriptlang.org) for strong typing.
- *optionally* [vite](https://vitejs.dev) for better development.

neocomp is built around flexibility, it has no dependencies only existing. but it is good idea to
have comfortable development environment before beginning.

# installation
after having a ready normal npm project, type into the terminal.
```bash
npm install @neocomp/full
```
and you are good to go.

### using vite
neocomp provide a [vite plugin](../plugin.md) for build time template generation. it is possible to
generate the templates at runtime, but using the plugin reduce the bundle size.

to use the plugin, add the it to your vite config.
```typescript
import { neoTempPlugin } from './src/build/plugin.ts';

export default {
	//...
	plugins: [neoTempPlugin()]
}
```

# defining components
component are the base unit in neocomp, each component represent a reusable user interface unit.   
each component encapsulate its own state and logic. 

the base boliplate for any component:
```typescript
import { Component, registry } from "@neocomp/full/comp-base";
import type { BaseMap, Template } from "@neocomp/full/comp-base";

//optional, a type that contains types used in the component
interface TypeMap extends BaseMap {

}

//a class that contains the component logic
class ExampleComponent extends Component<TypeMap> {
	//the initial dom structure
	static template: Template = /* ... */;
	constructor (el?: HTMLElement) {
		//el: an optional element for the component to wrap
		super(el);

		//initial state definition goes here

		//construct the initial dom structure and bindings
		this.initDom();

		//initial logic that use the dom goes here

		//notify the outside world
		this.fireInit();
	}
}

//optional, register the component to be used in different system by name
registry.add('example', ExampleComponent);
```

this might seem a lot of code, but in real many of it is optional, and provide improved developer
experience.

### why not a function
being a function requires you to construct the element synchronously, also it has inflixible 
organazation (only one function).    

classes on the other hand can create the base synchronously and then perform asyncronous updates.    
also logic can be organized into methods with shared states in properties.  

functions are good in factory paradigm, but classes are the best for logicfull components.

# integrating neocomp
neocomp components are be used freely as independent units. but if used as the base of a site, 
they must start from a common root.

that root is called the root component, and it is registered through.
```typescript
import { registry } from "@neocomp/full/comp-base";

registry.setRoot(new RootComponent(rootElement));
```
where `rootElement` is the root element of the page;