# states fundamentals
states in neocomp are stored in `Store`s, units that manage state storing and updating.

every `Component` and `Context` contain a `Store`.

and they are very reactive, each update can trigger a series of effects.

every property has an id associated to it.

## `Signal`
```typescript
export class Signal <T> {
	constructor (store: Store<any>, prop: PropId<T> | number);
	value: T;
	peek (): T;
	update (): void;
	
	get id (): PropId<T>;
	get prop (): Prop<T>;
	get store (): Store<any>;
}

export class Store {
	signal <T = any> (value?: T): Signal<T>;
}
```
`Signal`: is a wrapper around a property that can be used and passed as a normal value.

it is the standared way of accessing and manipulating state.

`signal`: creates a `Signal` for a new property, take an optional default value.

for low level, signals can be constructed by passing a store and one of its properties id.

`value`: an accessor that reflect the property value, setting and getting it are reflected to the wrappped property.

`peek`: returns the current value of the wrapped property without being tracked.

`update`: trigger an update to the wrapped property.

#### example
```typescript
const a = store.signal(1);
a.value // => 1
a.value = 2;
a.value // => 2
a.peek() // => 1, doesnt get tracked

const b = store.signal([1, 2, 3]);
b.value.push(4);
b.update(); // reactivity dont reach properties fields
```

### `Signal` meta

`id`: returns the wrapped property id.

`prop`: returns the wrapped property definition.

`store`: return the store containing the wrapped property.   

#### example
```typescript
const a = store.signal(1);
a.id // => random
a.prop // => Prop<number>
a.store // => store
```

### other signal types
```typescript
export class Signal <T> {
	get asReadOnly (): ReadOnlySignal<T>
	get asWriteOnly (): WriteOnlySignal<T>
}
export class ReadOnlySignal <T> {
	constructor (store: Store<any>, prop: PropId<T>);
	get value: T;
	peek (): T;
	get id (): PropId<T>;
	get prop (): Prop<T>;
	get store (): Store<any>;
}
export class WriteOnlySignal <T> {
	constructor (store: Store<any>, prop: PropId<T>);
	set value: T;
	update (): void;
	get id (): PropId<T>;
	get prop (): Prop<T>;
	get store (): Store<any>;
}
export class Store {
	ROSignal <T = any> (value?: T): ReadOnlySignal<T>;
	WOSignal <T = any> (value?: T): WriteOnlySignal<T>;
}
```
`ReadOnlySignal` are signal that only have read access to the wrapped property, setting its `value` throw errors.

`WriteOnlySignal` are signal that only have write access to the wrapped property, getting its `value` throw errors.

#### `Signal` properties
`asReadOnly`: convert the signal to `ReadOnlySignal`.

`asWriteOnly`: convert the signal to `WriteOnlySignal`.

#### `Store` methods
`ROSignal`: creates a `ReadOnlySignal` for a given property.

`WOSignal`: creates a `WriteOnlySignal` for a given property.

all of these methods take an optional default value.

#### example
```typescript
const a = store.signal(1);

const readOnlyA = a.asReadOnly;
readOnlyA.value // => 1
readOnlyA.value = 2; // throw error

const writeOnlyA = a.asWriteOnly;
writeOnlyA.value = 2;
a.value // => 2
writeOnlyA.value // error
```

## effects
```typescript
export class Store {
	effect (
		handler: (this: EffectUnit) => void, bindings?: any[], meta?: object
	): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[],
		handler: (this: EffectUnit) => void, bindings?: any[], meta?: object
	): void;
}

export type EffectedProp = number | Signal<any> | WriteOnlySignal<any>;
export type EffectingProp = number | Signal<any> | ReadOnlySignal<any>;
```
effects are functions that listen for property changes, they are called on updates and can 
also update other properties so the reactivity continue.

`effect`: adds an effect that depends on the specified properties.

the dependencies can be given manually through `effectedBy` (effect is triggered by their changes) and `effect` (what the effect updates), else they are tracked automatically if not specified.

`effectedBy` and `effect` accepts properties by their id and signals wrapping them.

effects are called on definition.

`effect` accepts also optionally the `bindings` the effect is bound to (like linkables), so the effect is removed when they are removed. also it accepts user defined metadata in `meta`.

#### example
```typescript
// a, b, c: signals

store.effect(() => console.log('a: ', a.value));
a.value = 1; // => a: 1

// accept signals and symbols
store.effect([a], [b.id], () => { b.value = a.value * 2 });
a.value = 2; // => b: 4

// linked effects
link(comp, linkable);
store.effect(() => console.log('c: ', c.value), [linkable]);
c.value = 3; // => c: 3
unlink(comp, linkable);
c.value = 4; // nothing
```

## computed properties
```typescript
export class Store {
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
}
```
`computed`: creates a computed property, a property that derive from other properties.

a computed property is given through the result of a function that is called on its dependencies changes.

the dependencies are tracked automatically, or can be given manually through `effectedBy`, like effects arguments.

`computed` returns a `ReadOnlySignal` so that the computed property can not be overwritten.

#### example
```typescript
const a = store.signal(1);
const b = store.computed(() => a.value * 2);
b.value // => 2

const c = store.computed([a, b], () => a.value * b.value);
a.value = 2;
c.value // => 8

b.value = 3 // throw error
```