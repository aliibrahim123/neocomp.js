# `Component` class
neocomp is a component oriented framework, this means that it is build on the idea of components.

a component is a buillding unit that represet a chunk of the user interface, it creates or wraps a `HTMLElement` and define logic and state associated to it.

components are typesafe, reactive, oraganizable, flixible and lightweight.

a component is a class that contains: 
- a `HTMLElement` that it owns.
- states contains in a specific unit called `Store`.
- `constructor` that initializes the component.
- methods that create sections (reusable mini ui fragments). 
- logic methods that alter the states.
- additional metadata and utilities for ease of use.

in general, the flow of control in a component is:    
```
events (DOM / external)
 --(call)-> methods (logic) 
  --(update)-> states 
   --(trigger)-> effects 
    --(effect)-> DOM (static bindings)
```

## constructor and options
```typescript
export class Component implements DataSource {
	constructor (el?: HTMLElement);
	options: CompOptions;
	static defaults: CompOptions;
}

export type CompOptions = {
	anonymous: boolean;
	defaultId: (comp: Component) => string;
	removeChildren: boolean;
	store: Partial<StoreOptions>;
	view: Partial<ViewOptions>;
}
```
`constructor`: take an optional `HTMLElement`, and construct a `Component`.    
see initialization for more info.

`options`: is the `CompOptions` defined for this component.

`defaults`: is the default options defined for all instances of this component class.

### `CompOptions`
- `defaultId`: a function that returns an id for the component if the passed element has no id or it is not given.
- `anonymous`: if `true`, the component doesnt notify the global systems, like idmap and onNew global event, default `false`.
- `removeChildren`: if `true`, remove its children with its removal, default `true`.
- `store`: options passed to the store of the component.
- `view`: options passed to the view of the component.

#### example
```typescript
class Example extends Component {
	static defaults = {
		// important
		...Component.defaults,

		// default id is 6 digit hexadecimal number
		defaultId: (comp) => Math.round(Math.random() * (16**6)).toString(16),

		// this component is a placeholder, dont notify the global systems
		anonymous: true,

		// preserve children
		removeChildren: false
	}
}
```

## main metadata
```typescript
export class Component {
	id: string = '';
	name: string = '';
	status: Status;
}

export type Status = 'preInit' | 'inited' | 'removing' | 'removed';
```

`id`: the identifier of the component, it is globaly unique, so it can be used as a key.

by default, it is the id of the element given at construction, else the result of `options.defaultId`, as a fallback, a 9 digit random number or `name-xxx` if `name` is given. 

`name`: the human readable name of the component, can be used as a unique key at the local scale (near parent and children).

it is given by the `neo:name` attribute of the element given at construction, else empty string unless changed by the user at initialization.

`status`: the status of the component, it can be one of the following:
- `initing`: the component is under initialization.
- `inited`: component has been initialized completly.
- `removing`: component is in the removing phase, triggering remove events.
- `removed`: component has been fully removed, if you see this there is memory leak.

#### example
```typescript
new Component() // id: random, name: ''

new Component(constructOne(`<div id=id neo:name=name></div>`)) // id: id, name: name
```

## initialization
```typescript
export class Component {
	createTop (): ChunkBuild;
	fireInit (): void;
}
```
initialization is a very important step in component lifecycle, it defines the inital state, DOM structure and bindings, and interactions with the world.

it is done in the constructor of the derived `Component` classes, which have the following signature: 
```typescript
constructor (el?: HTMLElement, ...args: any[])
```

### initialization sequence
a normal intialization sequence consitis of:
- `super(el)`: initialize the core of the component.
- `createTop()`: return a chunk build to create the intial DOM structure.
- most init logic goes here.
- `fireInit()`: trigger the initialization events and notify the outside world, the component is fully initialized.
- post init code and interactions (async code / heirarchy) is run afterward.

#### `createTop()` notes
the root chunk build with `createTop` must contains one root element.

in case an element is not given, the root is used.

in case an element is given, it is used as the top element with the content of the chunk replacing its content and the attributes of the chunk merging with its ones.

the root chunk is ended implicitly with `fireInit`, it can be ended manually through `end` function of the chunk build.

#### example
```typescript
constructor (el?: HTMLElement, ...args) {
	super(el);
	const { html } = this.createTop(); 
	// most init code
	this.fireInit(); // fully inited
	// async code / external system if required
}

// wraps an element
constructor (el?: HTMLElement) {
	const { html } = this.createTop();
	html`<div always-attr=some ${el ? attrsCaseGiven : attrsForDefault}>`;
	// ...
	html`${el?.childNodes}`; // transfer elements
	html`</div>`;
	this.fireInit();
}
```

### initialization events
```typescript
export class Component {
	onInitInternal: OTIEvent<(comp: this) => void>;
	onInit: OTIEvent<(comp: this) => void>;
}
```
these events are for system use cases.

`onInitInternal`: triggered when the component is fully inited, for internal systems before
external notifying.

`onInit`: triggered when the component is fully init, for external use (hierarchy). 

by convention, all external interaction with the component must be called within `onInit`.because, the initial component may be a placeholder for the true component, like in lazy loading.    
for this, use the component passed by the event not the listened one.

#### example
```typescript
const lazy = new (registry.get('@lazy:example'))(); // LazyComp
lazy.prop.value = value; // error
lazy.onInit.listen((comp) => { // ExampleComp
	comp.prop.value = value;
});

const comp = new ExampleComp();
comp.status; // => 'inited'
comp.onInit.listen((comp) => console.log('inited')) // => inited
```

## removing
```typescript
export class Component {
	onRemove: Event<(comp: this) => void>;
	remove (): void;
}
```
`remove`: removes the component and unlink it from everything (DOM, parent, children, global, links).

can be called multiple times safely while being in removing phase.

if you noticed a removed component in an unusual place, there is a memory leak.

`onRemove`: an event triggered on removing, use it for clean up.    
there are other events specialized for external systems / hierarchy.

#### example
```typescript
comp.onRemove.listen((comp) => {
	someInternals.remove(comp);

	comp.remove(); // noop, since status = 'removing'
});

comp.remove();
```

## hierarchy
```typescript
export class Component {
	parent?: Component;
	children: Component[];
}
```
components has an optional parent children hierarchy.

in normal apps, the greatest grandfather is the root component.

all hierarchy interactions are done after init.

`parent`: the parent of the component, it is optional.

`children`: the children of the component.

### linking
```typescript
export class Component {
	addChild (child: Component, ind: number = -1): void;
	linkParent (parent: Component): void;
	onChildAdded: Event<(comp: this, child: Component) => void>;
	onAddedToParent: Event<(comp: this, parent: Component) => void>;
}
```
`addChild`: add a child to a component at a given index, by default at the end.    
the index can be negative, it doesnt append the child top element.

`linkParent`: link the passed component as parent to the component.

`addChild` calls `linkParent` on the child, while `linkParent` doesnt add the child to the parent.   
in normal cases use `addChild`.

`onChildAdded`: an event triggered when a child of the component is added.

`onAddedToParent`: an event triggered when a parent of the component is linked.

#### example
```typescript
const parent = new Component(); // chilren: []

parent.addChild(new Component(constructOne('<div neo:name=child1></div>'))); 
	// children: [child1]

parent.addChild(new Component(constructOne('<div neo:name=child2></div>')), 0); 
	// children: [child2, child1]
```

### unlinking
```typescript
export class Component {
	unlinkParent (): void;
	unlinkChild (child: Component) :void;

	onChildUnlink: Event<(comp: this, child: Component) => void>;
	onUnlinkedFromParent: Event<(comp: this, parent: Component) => void>;
}
```
`unlinkParent`: unlink the parent of the component.   

`unlinkChild`: unlink the given child from component.

`unlickParent` calls `unlinkChild` on the parent, while `unlinkChild` doesnt unlink the parent
from the child.    
in normal cases use `unlinkParent`.

`remove` also unlink the parent and children.

`onUnlinkedFromParent`: an event triggered when the parent of the component is unlinked.

`onChildUnlink`: an event triggered when a child of the component is unlinked.

use these events for cleanup instead of `onRemove`, they are called on component removal.

#### example
```typescript
const parent = /* */; // chilren: [child1, child2]

parent.child1.unlinkParent(); // chilren: [child2]

parent.child2.remove(); // chilren: []
```



## linking
```typescript
export class Component {
	onLink: Event<(comp: this, linked: Linkable) => void>;
	onUnlink: Event<(comp: this, unlinked: Linkable) => void>;
	link (other: Linkable): void;
	unlink (other: Linkable): void;
	hasLink (other: Linkable): boolean;
}
```
`Component` implements the `Linkable` interface, read linkable section for more info.

use `onUnlink` eventea for cleanup insted of `onRemove`, it is called on component removal.

`remove` unlink the linked linkables.

#### example
```typescript
const comp = new Component();
const context1 = new Context();
const context2 = new Context();

link(comp, context1);
link(comp, context2);

unlink(comp, context1); // unlinked manually

comp.remove(); // context2 unlinked automatically
```

## store
```typescript
export class Component {
	signal<T = any> (value?: T): Signal<T>;
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
	effect (handler: () => void): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[], handler: () => void
	): void;
}
```
every component has a `Store` that contains the state.

`signal`: creates a signal for a new property.

`computed`: creates a computed property and returns a `ReadOnlySignal` of it.

`effect`: add an effect effected by and effecting a given properties.

for more details read [state fundamentals](../comp-base.state/fundamentals.md)

#### example
```typescript
let a = comp.signal(1);
a.value // => 1

let c = comp.computed(() => a.value + 1); // => 2

comp.effect(() => console.log(a.value, c.value));

a.value = 2; // => 2, 3
```

## view
```typescript
export class Component {
	view: View;
	el: HTMLElement;
	query <T extends HTMLElement = HTMLElement> (selector: string): T[];
	chunk (el?: HTMLElement): ChunkBuild;
	chunk (builder: (build: ChunkBuild) => void): HTMLElement;
	$chunk (parts: TemplateStringsArray, ...args: ChunkInp[]): HTMLElement
}

export const attachedComp: symbol;
```
every component has a `View` responsible for managing the DOM.

`el`: represents the top element that the component owns.

`query`: return all elements in the top element that match the given selector.

`chunk`: create a new chunk, take optionally a root element and return a chunk build, or take a function that builds the chunk and return the constructed element.

`$chunk`: construct a chunk in a tagged template syntax, can be optimized at build time.

`attachedComp`: a symbol added to top element where its value refers to the attached component.

#### example
```typescript
class Example extends Component {
	constructor () {
		super();
		this.createTop().html`<div id=comp>
			<span>hallo</span><span>world</span>
		</div>`;
		this.fireInit();
	}
}
const comp = new Example();

comp.el; // => <div id=comp>
comp.el[attachedComp] // => comp

comp.query('span'); // => [<span>hello</span>, <span>world</span>]

let { html, end } = comp.chunk();
html`<div>hallo</div>`;
end(); // => <div>hallo</div>

comp.chunk(({ html }) => html`<div>hallo</div>` }); // => <div>hallo</div>

comp.$chunk`<div>hallo</div>`; // => <div>hallo</div>
```