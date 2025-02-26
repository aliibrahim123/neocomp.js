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

type CompClass = new (...args: any[]) => AnyComp;
export type CompProvider = (name: string) => CompClass;
```
class registry stores the classes of the components and the providers.

`CompClass`: a class extending `Component`.

`add`: add a `CompClass` to the registry.

`get`: get the `CompClass` registered as `name`.   
if `name` of syntax `@provider:comp`, return the `CompClass` of the given `comp` provided by
the `provider`.

`has`: check if there is a `CompClass` registered as a given name.

`CompProvider`: is a function that takes a name and returns a `CompClass`.

built in provides: [`lazy`](#lazy-provider).

`addProvider`: add the given `CompProvider`.

`onAdd`: an event triggered after a new `CompClass` is registered.

## id map
```typescript
export const registry: {
	addToIdMap (id: string, comp: AnyComp): void
	getById (id: string): PureComp;
	removeFromIdMap (id: string): boolean;
}
```
id map stores the components by their ids.

`addToIdMap`: add a component by its id.

`getById`: get a component of a given id.

`removeFromIdMap`: remove a component from id map by id, returns `true` if there was a 
component added before, else `false`.

## global component events
```typescript
export const onNew: Event<(comp: PureComp) => void>;
export const onRemove: Event<(comp: PureComp) => void>;
```
`onNew`: an event triggered after a component is inited.

`onRemove`: an event triggered after a component is removed.

## root
```typescript
export const registry: {
	root: PureComp | undefined;
	setRoot (comp: AnyComp): void;
	removeRoot (): void;
}

export const onRootAdd: Event<(comp: PureComp) => void>;
export const onRootRemove: Event<(comp: PureComp) => void>;
```
`root` is the root component that contains all the components in the page.

`setRoot`: set the given component as a root.

`removeRoot`: remove the root completely by calling `remove` on it.

**note**: `remove` method on `Component` also remove itself from the registry if it is the root.

`onRootAdd`: an event triggered when a root is added.

`onRootRemove`: an event triggered when the root is removed.

# `lazy` provider
```typescript
export class LazyComp { 
	constructor (name: string, el?: HTMLElement, ...args: any[]);
	onInit: OTIEvent<(comp: PureComp) => void>;
}
```
the `lazy` provider allow lazy loading for components.

**syntax**: `'@lazy:comp'` where comp is the component name.   
**returns**: `LazyComp`.

`LazyComp` is a placeholder for a future `Component`, it is constructed by a given name and an
optional element and arguments that are passed to the future component.

it waits for the waited `CompClass` to be registered, then it construct a component with the
given arguments and pass it to the `onInit` event, after that normal interactions with the
component is done.

**note**: by convention, every interaction with an unkown state component is done on the 
`onInit` event.