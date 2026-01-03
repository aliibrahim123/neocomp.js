# `View`
`View`: is the unit that connects the component with the DOM.

it is responsible for the initial render and DOM managment. also it provides various utilities
for simplifing working with DOM.

## constructor and options
```typescript
export class View {
	constructor (comp: Component, el?: HTMLElement, options?: Partial<ViewOptions>);
	comp: Component;
	el: HTMLElement;
	options: ViewOptions;
	static defaults: ViewOptions;
}

export interface ViewOptions {
	liteConverters: Record<string, (lite: LiteNode) => Node> = {};
	removeEl: boolean = true;
}
```
`constructor`: take a component and optional element and `ViewOptions`.

`el`: the top element of the component, can be the passed host element, else the result of 
`options.defaultEl`.

`options`: is the view options defined for this view.

`defaults`: is the default options defined for all instances of the view.

### `ViewOptions` 
- `liteConverters`: a record of functions used to convert litenodes of given tag name to
DOM nodes.
- `removeEl`: remove the top element when the component is removed, default `true`.

#### example
```typescript
class Example extends Component {
	static defaults = {
		//...
		view: {
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
}
```
`query`: return all elements in the top element that match the given selector.

#### example
```typescript
const sections = view.query('.section');
```

## chunks
```typescript
export class View {
	createChunk (el?: HTMLElement, destroyable?: false): ChunkBuild;
	createChunk (el?: HTMLElement, destroyable?: true): ChunkBuild & { remove: () => void };
}
```
`createChunk`: create a new chunk build, optionaly taking the root element.

if there is 1 element in root in case no root is given, it is returned directly.

chunk that need to be destroyed must set `destroyable` to true, in which a `remove` function is returned in the build that safely remove every item (properties, links, component children, effects, ...) associated with the chunk.

#### example
```typescript
const { $temp, end } = view.createChunk();
$temp`<div>hallo</div>`;
end() // => <div>hallo</div>

const { $temp, end } = view.createChunk(document.createElement('section'));
$temp`<div>hallo</div>`;
end() // => <section><div>hallo</div></section>

let a = comp.signal(0);
const { $temp, end, remove } = view.createChunk(undefined, true);
let b = comp.signal(0);
comp.effect(() => console.log('a: ', a.value, ', b:', b.value));
$temp`<div>hallo</div>`;
$temp`${new SomeComp}`;
link(comp, someLinkable);
end() // => <div>hallo</div>

b.value = 1; // => a: 0, b: 1
remove(); // => removed SomeComp, unliked someLinkable, removed b and its derived effects
a.value = 1; // => nothing
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

store.addEffect(() => /* update some properties on an element */, [], { el: someElement });
someElement.remove();
view.cleanup(); // the effect added is removed
```