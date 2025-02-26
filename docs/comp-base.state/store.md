# `Store`
`Store` is a unit that connects to a `Linkable` and manage its states.

## constructor and options
```typescript
export class Store <Props extends Record<string, any>> {
	base: Linkable;
	constructor (base: Linkable, options?: Partial<StoreOptions>): void;
	options: StoreOptions;
	static defaults: StoreOptions;
}

export interface StoreOptions {
	static: boolean = false;
	addUndefined: boolean = false;
	baseProp: Prop<any>;
	updateOnDefine: boolean = true;
	updateOnSet: boolean = true;
	updateDispatcher: Partial<UDispatcherOptions>
}
```
`constructor`: take a `base` of type `Linkable` and optional `StoreOptions`.

`base`: is the `Linkable` the `Store` is attached to.

`options`: is the `StoreOptions` defined for this store.

`defaults`: is the default `StoreOptions` defined for all instances of the `Store`.

### `StoreOptions`
- `static`: all properties are static by default, doesnt trigger updates. default, all 
properties are reactive.
- `addUndefined`: allow the addition of undefined properties, through `set` not first by 
`add`, default is to disallow.
- `baseProp`: the base definition for all properties.
- `updateOnDefine`: trigger update on property define, default `true`.
- `updateOnSet`: trigger update on property setting, default `true`.
- `updateDispatcher`: the options passed to the update dispatcher.

## state management
```typescript
export class Store <Props> {
	add <P extends keyof Props> (name: P, propObj?: Partial<Prop<Props[P]>>): Prop<Props[P]>;
	has (name: keyof Props | symbol): boolean;
	remove (name: keyof Props | symbol): void;

	getProp <P extends keyof Props> (name: P | symbol): Prop<Props[P]>;
	getSymbolFor (name: keyof Props): symbol;

	onAdd: Event<(store: this, prop: Prop<any>) => void>;
	onRemove: Event<(store: this, prop: Prop<any>) => void>;
}

export interface Prop <T> {
	value: T;
	name: string;
	symbol: symbol;
	isStatic: boolean;
	meta: Record<keyof any, any>;
	init?: (this: this) => void;
	getter?: (this: this) => T;
	setter?: (this: this, value: T) => void;
	comparator: (old: T, New: T) => boolean;
}
```
see also [`get` and `set` methods](./accessing.md#get-and-set)

`add`: add a given property, optionally take a `Partial<Prop>` as definition.

`has`: whether the `Store` has the given property defined.

`remove`: remove a property from the `Store`.

`getProp`: get the `Prop` definition of a given property.

`getSymbolFor`: get the symbol of a given property. if not defined, returns a future valid
property symbol.

`onAdd`: an event triggered when adding a property.

`onRemove`: an event triggered when removing a property.

### `Prop`
the definition of the property, it contains:
- `name`: the property name.
- `symbol`: the property symbol.
- `value`: the property value.
- `isStatic`: whether the property is static. if static, doesnt trigger updates.
- `init`: a function that initialize the property.
- `getter`: a function called to get the value of the property.
- `setter`: a function called to set the value of the property.
- `comparator`: a function that compares the old and new values of the property when 
setting. if `true`, trigger update.

-----
see also [`Signal` methods](./accessing.md#store-methods) and [`addEffect`](./binding.md#effects)

## updating
```typescript
export class Store <Props> {
	forceUpdate (name: keyof Props | symbol): void;
	updateAll (withStatic: boolean = true): void;

	onChange: Event<(store: this, props: Prop<any>[]) => void>;
}
```
a property is updated on setting and on adding based on options, or by force.

`forceUpdate`: force trigger an update for a given property.

`updateAll`: trigger update for all properties.   
can be with statics, by default `true`.

`onChange`: an event triggered on updates, passed with the updated properties.

### bulk updating
```typescript
export class Store <Props> {
	get bulkUpdating (): boolean;
	startBulkUpdate () : boolean;
	endBulkUpdate (): boolean;
}
```
when setting multiple properties one by one by `set`, each call to `set` triggers an 
independent update.  
this can cause overupdates where the common effects between the changed properties is called
by each update.

to solve this, the `Store` provide a mechanism called bulk updating where changes are 
collected and triggered once as a big update.

`bulkUpdating`: whether the `Store` is in a bulk update.

`startBulkUpdate`: starts bulk updating.

`endBulkUpdate`: ends bulk updating.

**note:** these methods inc/dec internal counter and only triggers the update when the 
counter returns to zero.   
this is implemented to make overlapping batches a single batch.

`setMultiple`: triggers a bulk update internally.

## utilities
```typescript
export class Store <Props> {
	get asObject (): Props;
	get asMap (): Map<string, any>;
	*[Symbol.iterator] (): Iterator<Prop<any>>;
	get propsToBeAdded (): string[];
}
```
`asObject`: returns all the properties in an `object`.

`asMap`: returns all the properties in a `Map`.

`*[Symbol.iterator]`: allows iteration through the properties in `for ... of` loops.

`propsToBeAdded`: returns the properties used by `getSymbolFor` and had not been added.