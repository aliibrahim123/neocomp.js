# registry
the registry handles the global component managment.

## class registry
```typescript
export const registry: {
	add (name: string, Class: CompClass): void,
	has (name: string): boolean,
	get (name: string): CompClass,
	addProvider (name: string, provider: CompProvider): void,
}

export const onAdd: Event<(name: string, comp: CompConstructor) => void>;

type CompClass = new (...args: any[]) => Component;
type CompProvider = (name: string) => CompClass;
```
class registry stores the classes of the components and the providers to be used by other systems.

`CompClass`: a class extending `Component`.

builtin components: `base: Component`.

`add`: register component class as `name` to the registry.

`get`: get the component class registered as the given name.

if name is of syntax `@provider:comp`, return the component class of the given `comp` provided by
the `provider`.

`has`: check whether there is a compoment class registered as a given name.

`CompProvider`: a provider takes a name and returns a custom `CompClass`, they provide custom 
creation for the specified components.

built in providers: [`lazy`](#lazy-provider).

`addProvider`: add the given component provider.

`onAdd`: an event triggered after a new component class is registered.

#### example
```typescript
onAdd.listen((name) => console.log('registered', name));

class Example extends Component { }
registry.add('example', Example); // => registered example

registry.get('example'); // => Example

registry.has('example'); // => true
registry.has('unknown'); // => false

registry.addProvider('of-tag', (name) => () => new Example(name));
new (registry.get('@of-tag:span'))(); // Example { el: <span> }
```

## idmap
```typescript
export const registry: {
	addToIdMap (id: string, comp: Component): void
	getById (id: string): Component;
	removeFromIdMap (id: string): boolean;
}
```
id map is a global registry that stores the components by their ids.

`addToIdMap`: add a component by its id.

`getById`: get a component of a given id.

`removeFromIdMap`: remove a component from id map by id, returns `true` if there was a 
component added before, else `false`.

components are added to id map by default after initialization.

#### example
```typescript
const comp = new ExampleComp(constructOne(`<div id=id></div>`));
registry.getById('id'); // => ExampleComp

comp.remove();
registry.getById('id'); // => undefined

new AnanymousComp(constructOne(`<div id=id></div>`)); // options.anonymous = true
registry.getById('id'); // => undefined
```

## global component events
```typescript
export const onNew: Event<(comp: Component) => void>;
export const onRemove: Event<(comp: Component) => void>;
```
`onNew`: an event triggered after a component is inited.

`onRemove`: an event triggered after a component is removed.

triggered after component initialization.

#### example
```typescript
onNew.listen((comp) => console.log('new', comp));
onRemove.listen((comp) => console.log('removed', comp));

const comp = new ExampleComp()); // => new ExampleComp

comp.remove(); // => removed ExampleComp
```

## root
```typescript
export const registry: {
	root: Component | undefined;
	setRoot (comp: Component): void;
	removeRoot (): void;
}

export const onRootAdd: Event<(comp: Component) => void>;
export const onRootRemove: Event<(comp: Component) => void>;
```
`root` is the root component that contains all the components in the page.

`setRoot`: set the given component as a root, doesnt append it to DOM nor remove the old root.

`removeRoot`: remove the root from registry, doesnt remove it itself.

`remove` method on `Component` also remove itself from the registry if it is the root.

`onRootAdd`: an event triggered when a root is added.

`onRootRemove`: an event triggered when the root is removed.

#### example
```typescript
onRootAdd.listen((comp) => console.log('root added', comp));
onRootRemove.listen((comp) => console.log('root removed', comp));

const root = new ExampleComp();
registry.setRoot(root); // => root added ExampleComp
registry.root; // => ExampleComp

registry.removeRoot(); // => root removed ExampleComp
root.status; // => 'inited'

registry.setRoot(root);
registry.root.remove(); // => root removed ExampleComp
```

# `lazy` provider
```typescript
export class LazyComp { 
	constructor (name: string, el?: HTMLElement, ...args: any[]);
	onInit: OTIEvent<(comp: Component) => void>;
}
```
the `lazy` provider allow lazy loading for components.

**syntax**: `'@lazy:comp'` where comp is the component class name.   
**returns**: `LazyComp`.

`LazyComp` is a placeholder for a future component of class name `comp`, it is constructed by a 
given name and optional element and arguments that are passed to the future component.

it waits for the specified component class to be registered, then it construct a component with
the given arguments and pass it to the `onInit` event, and normal interactions continue with
the new component.

#### example
```typescript
const lazy = new (registry.get('@lazy:example'))(); // LazyComp
parent.onChildAdded.listen((comp) => console.log('child added', comp));
lazy.onInit.listen((comp) => parent.addChild(comp));

registry.add('example', ExampleComp); // child added ExampleComp
```