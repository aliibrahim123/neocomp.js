# `Component` class
neocomp is a component oriented framework, this means that it is build on the idea of components.

a component is a buillding unit that represet a chunk of the user interface, it wraps a 
`HTMLElement` and define logic and state associated to it.

components are typesafe, reactive, oraganizable, flixible and lightweight.

a component is a class that contains: 
- a `HTMLElement` that it wraps and owns.
- states contains in a specific unit called `Store`.
- a `View` that manage the DOM interactions and bindings.
- logic in methods that alter the states.
- additional metadata and utilities for ease of use.

in general, the flow of control in a component is:    
```
events (DOM / external)
 --(call)-> methods (logic) 
  --(update)-> states 
   --(trigger)-> effects 
    --(effect)-> DOM (static bindings)
```

### why not a function
being a function requires you to construct the element synchronously, also it has inflixible 
organazation (only one function).    

classes on the other hand can create the base synchronously and then perform asyncronous updates.    
also logic can be organized into methods with shared states in properties.  

functions are good in factory paradigm, but classes are the best for logicfull organized 
components, components that contains logic other than construction and simple binding.

## `TypeMap`
```typescript
export interface BaseMap {
	props: Record<string, any>,
	refs: Record<string, HTMLElement | HTMLElement[]>,
	childmap: Record<string, PureComp>,
	chunks: string
}

export type getTypeMap <Comp> = BaseMap;
export type getProps <Comp> = BaseMap['props'];
export type getRefs <Comp> = BaseMap['refs'];
export type getChildMap <Comp> = BaseMap['childmap'];
export type getChunks <Comp> = BaseMap['chunks'];
```
`TypeMap`: is an abstracted type that groups the types used in `Component`.

it must extends from `BaseMap`, the base of all `TypeMap`, and it can contains any other types.

`TypeMap` can contain
- `props`: a record of properties and their respectfull types.
- `refs`: a record of element references and their respectfull types, see `Component.refs`.    
can be single `HTMLElement` for single reference or `HTMLElement[]` for multiple element per 
reference.
- `childmap`: a record of children names and their respectfull types, see `Component.childmap`.
- `chunks`: a union of `string` literials of the chunk names.

`getTypeMap`: extract the typemap of a given `Component`.

`getProps`, `getRefs`, `getChildMap` and `getChunks`: extracts the respectfull typemap field from
a given `Component`.

#### example
```typescript
interface TypeMap extends BaseMap {
	props: {
		title: string, count: number
	},
	refs: {
		input: HTMLElement, sections: HTMLElement[]
	}
}

interface TypeMap extends BaseMap {
	childmap: {
		sectionA: SectionA, sectionB: SectionB
	},
	chunks: 'item' | 'title' | 'minititle'
}
```

## constructor and options
```typescript
export class Component <TypeMap extends BaseMap> implements Linkable {
	constructor (el?: HTMLElement, initMode: 'core' | 'dom' | 'full' = 'core');
	options: CompOptions;
	static defaults: CompOptions;
	static template: Template;
	static chunks: Record<string, Template> = {};
}

export type CompOptions = {
	anonymous: boolean;
	defaultId: (comp: PureComp) => string;
	removeChildren: boolean;
	store: Partial<StoreOptions>;
	view: Partial<ViewOptions>;
}
```
`constructor`: take an optional `HTMLElement` and `initMode`, and construct a `Component`.    
see initialization for more info.

`options`: is the `CompOptions` defined for this component.

`defaults`: is the default options defined for all instances of this component class.

`template`: is the default template for this component, defaults to empty `<div>`.

`chunks`: optional static property that defines the chunks used in this component.

### `CompOptions`
- `defaultId`: a function that returns an id for the component if the passed element has no id or 
it is not given.
- `anonymous`: if `true`, the component doesnt notify the global systems, like idmap and
onNew global event, default `false`.
- `removeChildren`: if `true`, remove its children with its removal, default `true`.
- `store`: options passed to the store of the component.
- `view`: options passed to the view of the component.

#### example
```typescript
class Example extends Component<TypeMap> {
	//overide default template
	static template = $template(`<div>hallo world</div>`);

	//define custom chunks
	static chunks = {
		item: $template(`<div class=item .text>item @(){context.index}</div>`),
	}

	static defaults = {
		// important
		...Component.defaults,

		//default id is 6 digit hexadecimal number
		defaultId: (comp) => Math.round(Math.random() * (16**6)).toString(16),

		//this component is a placeholder, dont notify the global systems
		anonymous: true,

		//preserve children
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

export type Status = 'coreInit' | 'domInit' | 'inited' | 'removing' | 'removed';
```

`id`: the identifier of the component, it is globaly unique, so it can be used as a key.

by default, it is the id of the element given at construction, else the result of 
`options.defaultId`, as a fallback, a 9 digit random number or `name-xxx` if `name` is given. 

`name`: the human readable name of the component, can be used as a unique key at the local scale 
(near parent and children).

it is given by the `neo:name` attribute of the element given at construction, else empty string
unless changed by the user at initialization.

`status`: the status of the component, it can be one of the following:
- `'coreInit'`: the core of the component has been inited.
- `'domInit'`: the full initial structure and bindings of DOM has been established.
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
	elementArgs (): Record<string, any>;

	initDom (): void;
	fireInit (): void;
}
```
initialization is a very important step in component lifecycle, it defines the inital state, DOM 
structure and bindings, and interactions with the world.

it is done in the constructor of the derived `Component` classes, which have the following signature: 
```typescript
constructor (el?: HTMLElement, ...args: any[])
```

#### arguments
arguments can be passed through the constructor, or in template through `.arg:name` attributes, these are accesed through `elementArgs` method, callable only once.

```typescript
constructor (el?: HTMLElement, a?: number, b?: string) {
	//...
	({ a, b } = { a: a || 0, b: b || '', ...this.elementArgs() });
}
new Comp(ConstructOne('<div .arg:b="b"></div>'), 1) // a: 1, b: 'b'
```

### initialization sequence
a normal intialization sequence consitis of:
- `super(el)`: initialize the core of the component, the DOM is not touched yet.
- code that set the initial state and metadata, can be done in later stages but here it avoid 
dual updates.
- `initDom()`: initialize the initial DOM structure and establish the bindings for the component.
- code that require the DOM.
- `fireInit()`: trigger the initialization events and notify the outside world, the component is
fully initialized.
- post init code and interactions (async code / heirarchy) is run afterward.

#### skips
certain initialization phases can be skipped after `super(el)` throught `initMode` parameter of 
the `Component` contructor, its values: 
- `core`: the default and the standared, just initialize the core, rest are manual.
- `dom`: continue after DOM initialization, for component that state is managed directly in DOM.
- `full`: initialize everything and continue, for no init logic components.

#### example
```typescript
constructor (el?: HTMLElement, ...args) {
	super(el);
	// set initial state
	this.initDom(); //dom ready
	// code that use the dom
	this.fireInit(); //fully inited
	// async code / external system if required
}

constructor (el?: HTMLElement, ...args) {
	super(el, 'dom');
	// init code
	this.fireInit(); //fully inited
}

constructor (el?: HTMLElement, ...args) {
	super(el, 'full'); //no init code
}
```

### initialization events
```typescript
export class Component {
	onDomInit: OTIEvent<(comp: this) => void>;
	onInitInternal: OTIEvent<(comp: this) => void>;
	onInit: OTIEvent<(comp: this) => void>;
}
```
these events are for system use cases.

`onDomInit`: triggered when the initial DOM strucutre is constructed and before post `initDom` 
code.

`onInitInternal`: triggered when the component is fully inited, for internal systems before
external notifying.

`onInit`: triggered when the component is fully init, for external use (hierarchy). 

by convention, all external interaction with the component must be called within `onInit`.
because, the initial component may be a placeholder for the true component, like in lazy loading.    
for this, use the component passed by the event not the listened one.

#### example
```typescript
const lazy = new (registry.get('@lazy:example'))(); //LazyComp
lazy.set('prop', value); //error
lazy.onInit.listen((comp) => { //ExampleComp
	comp.set('prop', value);
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

	comp.remove(); //noop, since status = 'removing'
});

comp.remove();
```

## hierarchy
```typescript
export class Component {
	parent?: PureComp;
	children: PureComp[];
	childmap: TypeMap['childmap'];
}
```
components has an optional parent children hierarchy.

in normal apps, the greatest grandfather is the root component.

all hierarchy interactions are done after init.

`parent`: the parent of the component, it is optional.

`children`: the children of the component.

`childmap`: a record that maps component children by their names.

### linking
```typescript
export class Component {
	addChild (child: PureComp, ind: number = -1): void;
	linkParent (parent: PureComp): void;
	onChildAdded: Event<(comp: this, child: PureComp) => void>;
	onAddedToParent: Event<(comp: this, parent: PureComp) => void>;
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
const parent = new Component(); //chilren: [], childmap: {}

parent.addChild(new Component(constructOne('<div neo:name=child1></div>'))); 
	//children: [child1], childmap: { child1: child1 }

parent.addChild(new Component(constructOne('<div neo:name=child2></div>')), 0); 
	//children: [child2, child1], childmap: { child1: child1, child2: child2 }
```

### unlinking
```typescript
export class Component {
	unlinkParent (): void;
	unlinkChild (child: PureComp) :void;

	onChildUnlink: Event<(comp: this, child: PureComp) => void>;
	onUnlinkedFromParent: Event<(comp: this, parent: PureComp) => void>;
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
const parent = /* */; //chilren: [child1, child2], childmap: { child1: child1, child2: child2 }

parent.childmap.child1.unlinkParent(); //chilren: [child2], childmap: { child2: child2 }

parent.childmap.child2.remove(); //chilren: [], childmap: {}
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

unlink(comp, context1); //unlinked manually

comp.remove(); //context2 unlinked automatically
```

## store
```typescript
export class Component {
	store: Store<TypeMap['props']>;
	get <P extends keyof TypeMap['props']> (name: P | symbol): TypeMap['props'][P]
	set <P extends keyof TypeMap['props']> (name: P | symbol, value: TypeMap['props'][P]): void;
	setMultiple (props: Partial<TMap['props']>): void;
	signal <P extends keyof TypeMap['props']> (name: P | symbol, Default?: TypeMap['props'][P]):
	  Signal<TypeMap['props'][P]>;
	computed <P extends keyof TMap['props']> (
		name: P | symbol, effectedBy: EffectedProp<TMap['props']>[] | 'track', fn: () => TMap['props'][P]
	): ReadOnlySignal<Prop<P>>;
	effect (
		effectedBy: EffectedProp<TMap['props']>[], handler: () => void,
		effect?: EffectedProp<TMap['props']>[]
	): void;
	effect (track: 'track', handler: () => void): void;
}
```
every `Component` has a `Store` that contains the state.

`get` and `set`: get and set a given property.

`setMultiple`: set multiple properties at once.

`signal`: creates a `Signal` of a given property.

`computed`: creates a computed property and returns a `ReadOnlySignal` of it.

`effect`: add an effect effected by and effecting a given properties.

for more details read [fundamentals](../comp-base.state/fundamentals.md)

#### example
```typescript
comp.set('a', 1);
comp.get('a') // => 1

comp.setMultiple({ b: 2, c: 3 });

const a = comp.signal('a');

const d = comp.computed('d', 'track', () => a.value + 1); // => 2

comp.effect('track', () => console.log(a.value, d.value));

a.value = 2; // => 2, 3
```

## view
```typescript
export class Component {
	view: View<TypeMap['refs'], TypeMap['chunks']>;
	el: HTMLElement;
	refs: Record<keyof TypeMap['refs'], HTMLElement[]>;
	query <T extends HTMLElement = HTMLElement> (selector: string): T[];
	chunk (chunk: TMap['chunks'] | Template, context?: Record<string, any>): HTMLElement; 
}

export const attachedComp: symbol;
```
every `Component` has a `View` responsible for managing the DOM.

`el`: represents the top element that the component wraps.

can be the element passed to the component on construction, else an element created by 
`view.options.defaultEl`

`refs`: the references to elements created by [`@ref`](../comp-base.view/template.md#ref)
action attribute.

`query`: return all elements in the top element that match the given selector.

`chunk`: construct a given chunk optional passed with `context`.

`attachedComp`: a symbol added to top element where its value refers to the attached component.

#### example
```typescript
class ExampleComponent extends Component<TypeMap> {
	static template = $template(`<span @ref=hello>hello</span> <span>world</span>`)
	static chunk = { hello: $template(`<span .text>hello @(){context.to}</span>`) }
}
const comp = new ExampleComponent(constructOne(`<div id=comp></div>`));

comp.el; // => <div id=comp></div>

comp.query('span'); // => [<span>hello</span>, <span>world</span>]

comp.refs.hello; // => <span>hello</span>

comp.chunk('hello', { to: 'world' }); // => <span>hello world</span>
```

## component variants
```typescript
export type PureComp = Component<BaseMap>;
```
`PureComp`: is any `Component`, it is used to interact with components of any kind.

## infodump
```typescript
export class Component {
	infoDump (type: 'links'): Linkable[];
	infoDump (type: 'properties'): TMap['props'];
}
```
info dumps is a function used in debugging.

`infoDump('links')` returns the linkables linked to the component.
`infoDump('properties')` return the properties of the component.