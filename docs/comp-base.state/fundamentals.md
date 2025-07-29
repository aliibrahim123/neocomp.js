# states fundamentals
states in neocomp are stored in `Store`s, units that manage state storing and updating.

every `Component` and `Context` contain a `Store`.

states are used in neocomp in typesafe manner, their type difinition is declared in `TypeMap.props`.

and they are very reactive, each update can trigger a series of effects.

every property has a name and a symbol associated to it.

## `get` and `set`
```typescript
export class Store {
	get <P extends keyof Props> (name: P | symbol): Props[P];
	set <P extends keyof Props> (name: P | symbol, value: Props[P]): void;
	setMultiple (props: Partial<Props>): void;
}
```
the fundamental way of accessing state, used internally by all systems.

`get`: get the given property value, returns `undefined` if not added.

`set`: set the given property with `value`.

`setMultiple`: set multiple properties at once, it group the updates in a single batch.

use these methods when working directly with stores, or when using properties one time.

#### example
```typescript
store.set('a', 1);

store.get('a'); // => 1
store.get('b') // => undefined

store.setMultiple({ a: 2, b: 3 });
```

## `Signal`
```typescript
export class Signal <T> {
	constructor (store: Store<any>, prop: symbol);
	value: T;
	update (): void;
	
	get prop (): symbol;
	get name (): string;
	get Prop (): Prop<T>;
	get store (): Store<any>;
}

export class Store {
	createSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	  : Signal<Props[P]>;
}
```
`Signal`: is a wrapper around a property that can be used and passed as a normal value.

it is meant for general use, and it is the standared way of accessing state.

`createSignal`: creates a `Signal` for a given property.    
take an optional default value in case if the property was not added before

for low level, signals can be constructed by passing the store containing the property and its 
symbol.

`value`: an accessor that reflect the property value, setting and getting it are reflected to
the wrappped property.

`update`: trigger an update to the wrapped property.

#### example
```typescript
const a = store.createSignal('a', 1);
a.value // => 1
a.value = 2;
a.value // => 2

store.set('b', 2);
const b = store.createSignal('b', 3);
b.value // => 2

const c = store.createSignal('c', [1, 2, 3]);
c.value.push(4);
c.update(); // reactivity dont reach properties fields
```

### `Signal` meta

`name`: returns the wrapped property name.

`prop`: returns the wrapped property symbol.

`Prop`: returns the wrapped property definition.

`store`: return the store containing the wrapped property.   

#### example
```typescript
const a = store.createSignal('a', 1);
a.name // => 'a'
a.prop // => Symbol(neocomp:prop(a))
a.Prop // => Prop<number>
a.store // => store
```

### other signal types
```typescript
export class Signal <T> {
	get asReadOnly (): ReadOnlySignal<T>
	get asWriteOnly (): WriteOnlySignal<T>
}
export class ReadOnlySignal <T> {
	constructor (store: Store<any>, prop: symbol);
	get value: T;
	get prop (): symbol;
	get name (): string;
	get Prop (): Prop<T>;
	get store (): Store<any>;
}
export class WriteOnlySignal <T> {
	constructor (store: Store<any>, prop: symbol);
	set value: T;
	update (): void;
	get prop (): symbol;
	get name (): string;
	get Prop (): Prop<T>;
	get store (): Store<any>;
}
export class Store {
	createROSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	  : ReadOnlySignal<Props[P]>;
	createWOSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	  : WriteOnlySignal<Props[P]>;
}
```
`ReadOnlySignal` are signal that only have read access to the wrapped property, setting its
`value` throw errors.

`WriteOnlySignal` are signal that only have write access to the wrapped property, getting its
`value` throw errors.

#### `Signal` properties
`asReadOnly`: convert the signal to `ReadOnlySignal`.

`asWriteOnly`: convert the signal to `WriteOnlySignal`.

#### `Store` methods
`createROSignal`: creates a `ReadOnlySignal` for a given property.

`createWOSignal`: creates a `WriteOnlySignal` for a given property.

all of these methods take an optional default value in case if the property was not added before.

#### example
```typescript
const a = store.createSignal('a', 1);

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
	addEffect (
		effectedBy: EffectedProp<Props>[], handler: (this: EffectUnit) => void,
		effect: EffectedProp<Props>[], from?: Linkable, meta?: object
	): void;
	addEffect(
		track: 'track', handler: (this: EffectUnit) => void, unused?: undefined, 
		from?: Linkable, meta?: object
	): void;
}

type EffectedProp<Props> = keyof Props | symbol | Signal<Props[keyof Props]>;
```
effects are functions that listen for property changes, they are called on updates and can 
also update other properties so the reactivity continue.

`addEffect`: adds an effect that depends on the specified properties.

the dependencies can be given manually through `effectedBy` (effect is triggered by their changes) 
and `effect` (what the effect updates), or can be tracked automatically by passing `'track'` in 
the first argument.

`effectedBy` and `effect` accepts properties by their names, symbols or signals wrapping them.

effects are called on definition.

`addEfect` accepts also optionally the `Linkable` that added the effect in `from`, so the effect 
is removed when the link is removed. also it accepts user defined metadata in `meta`.

#### example
```typescript
// a, b, c: signals

store.addEffect(['a'], () => console.log('a: ', a.value));
a.value = 1; // => a: 1

//accept signals and symbols
store.addEffect([a], () => { b.value = a.value * 2 }, [b.prop]);

//auto track
store.addEffect('track', () => console.log('b: ', b.value)); // => b: 2
a.value = 2; // => b: 4

//linked effects
link(comp, linkable);
store.addEffect('track', () => console.log('c: ', c.value), undefined, linkable);
c.value = 3; // => c: 3
unlink(comp, linkable);
c.value = 4; // nothing
```

## computed properties
```typescript
export class Store {
	createComputed <P extends keyof Props> (
		name: P | symbol, effectedBy: EffectedProp<Props>[] | 'track', fn: () => Props[P]
	): ReadOnlySignal<Pros[P]>
}
```
`createComputed`: creates a computed property, a property that derive from other properties.

a computed property is given through the result of a function that is called on its dependencies 
changes.

the dependencies can be given manually through `effectedBy` or tracked automatically by passing
`'track'` in place of it, like effects arguments.

`createComputed` returns a `ReadOnlySignal` so that the computed property can not be overwritten.

#### example
```typescript
const a = store.createSignal('a', 1);
const b = store.createComputed('b', [a], () => a.value * 2);
b.value // => 2

//auto track
const c = store.createComputed('c', 'track', () => a.value * b.value);
a.value = 2;
c.value // => 8

b.value = 3 // throw error
```