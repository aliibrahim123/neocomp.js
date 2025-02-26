## about states
states in neocomp are stored in `Store`s, units that manage state storing and updating.

every `Component` and `Context` contain a `Store`.

states are used in neocomp in typesafe manner.

there are 3 ways of accessing states: 
- [`get` and `set` methods](#get-and-set)
- [`Signal`s](#signal)
- [store proxy](#store-proxy)

## `get` and `set`
```typescript
export class Store <Props> {
	get <P extends keyof Props> (name: P | symbol): Props[P];
	set <P extends keyof Props> (name: P | symbol, value: Props[P]): Prop<Props[P]>;
	setMultiple (props: Partial<Props>): void;
}
```
the fundamental way of accessing state, used internally by all systems.

`get`: get the given property value, returns `undefined` if not added.

`set`: set the given property with `value`, returns `Prop` of the property.

`setMultiple`: set multiple properties passed as `object`.

## `Signal`
```typescript
export class Store <Props> {
	createSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	  : Signal<Props[P]>;
	createROSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	: ReadOnlySignal<Props[P]>;
	createWOSignal <P extends keyof Props> (name: P | symbol, Default?: Props[P]) 
	: WriteOnlySignal<Props[P]>;
}

export class Signal <T> {
	constructor (store: Store<any>, prop: symbol);
	value: T;
	get prop (): symbol;
	get store (): Store<any>;
	get asReadOnly (): ReadOnlySignal<T>
	get asWriteOnly (): WriteOnlySignal<T>
}

export class ReadOnlySignal <T> {
	constructor (store: Store<any>, prop: symbol);
	get value: T;
	get prop (): symbol;
	get store (): Store<any>;
}
export class WriteOnlySignal <T> {
	constructor (store: Store<any>, prop: symbol);
	set value: T;
	get prop (): symbol;
	get store (): Store<any>;
}
```
`Signal`: is a wrapper around a property that can be passed as normal value.

it is constructed by passing the store containing the property and the property symbol.

### `Signal` fields
`value`: an accessor that reflect the property value, setting and getting it are reflected to
the wrapped property.

`store`: return the store containing the wrapped property.   
`prop`: returns the wrapped property symbol.

**for `Signal` only:**   
`asReadOnly`: convert the signal to `ReadOnlySignal`.   
`asWriteOnly`: convert the signal to `WriteOnlySignal`.

**note**: to get the wrapped property name, use `store.getProp(symbol.prop).name`.

### other signal types
`ReadOnlySignal` are `Signals` that only have read access to wrapped property, setting its
`value` throw errors.

`WriteOnlySignal` are `Signals` that only have write access to wrapped property, getting its
`value` throw errors.

### store methods
`createSignal`: creates a `Signal` for a given property.

`createROSignal`: creates a `ReadOnlySignal` for a given property.

`createWOSignal`: creates a `WriteOnlySignal` for a given property.

all of these methods take an optional default value and set it to the property if not added 
before.

## store proxy
```typescript
export function $proxy <Props extends Record<string, any>> (store: Store<Props>): Proxy<Props>
```
`$proxy` returns a `Proxy` wrapping the `Store`, getting and setting its properties reflect to
the wrapped `Store` properties.

use `in` operator on it returns whether the wrapped `Store` has the given property.

this allow the use of the properties as a normal `object`.

## what to use
- **for internal use**:
  - use `get` and `set` methods when accessing few times, it use strings for name which can be
	slightly slow to write.
  - use `Signal` when accessing multiple times, it requires set up.
- **for external use**:
  - use `Signal` when passing specific properties.
  - use `get` and `set` when working directly with `Store`.
- use store proxy if you like it.