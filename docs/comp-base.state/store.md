# `Store`
`Store` is a unit that connects to a `Linkable` and manage its states.

it is responsible for state storage and updating.

## constructor and options
```typescript
export class Store {
	base: DataSource;
	constructor (base: Linkable, options?: Partial<StoreOptions>): void;
	options: StoreOptions;
	static defaults: StoreOptions;
}

export interface StoreOptions {
	static: boolean = false;
	baseProp: Prop;
}
```
`constructor`: take a linkable as a `base` and optional `StoreOptions`.

`base`: is the linkable the store is attached to.

`options`: is the `StoreOptions` defined for this store.

`defaults`: is the default options defined for all instances of the `Store`.

### `StoreOptions`
- `static`: all properties are static by default, doesnt trigger updates. default, all 
properties are reactive.
- `baseProp`: the base definition for all properties.

## state management
```typescript
export class Store {
	get<T = any> (id: PropId<T> | number, peek?: boolean): T;
	set <T = any> (id: PropId<T> | number, value: T): void;

	create (def?: Partial<Prop>): Prop;
	has (id: number): boolean;
	remove (id: number): void;

	getProp (id: number): Prop;

	onAdd: Event<(store: this, prop: Prop => void>;
	onRemove: Event<(store: this, prop: Prop) => void>;
}
```
`get`: returns the value of an property by its id.     
accept optional `peek` parameter to return the value without being tracked.

`set`: sets the value of an property by its id.

`create`: creates a new property, optionally take a property definition.

`has`: whether the store has the given property defined.

`remove`: remove a property from the store.

`getProp`: get the definition of a given property.

`onAdd`: an event triggered when creating a new property.

`onRemove`: an event triggered when removing a property.

#### example
```typescript
store.onAdd.listen((store, prop) => console.log('added: ', prop.id));
store.onRemove.listen((store, prop) => console.log('removed: ', prop.id));

let a = store.create({ value: 1 }).id; // => added: a
store.get(a); // => 1;
store.set(a, 2);
store.get(a) // => 2;

store.has(a); // => true
store.has(0xffff) // => false

store.getProp(a).value // => 1

store.remove(a) // => removed: a
```

### `Prop`
```typescript
export interface Prop {
	value: any;
	id: number,
	static: boolean;
	meta: Record<keyof any, any>;
	comparator: (old: any, New: any, store: Store) => boolean;
}
```
the definition of the property, it contains:
- `id`: the property identifier.
- `value`: the property value.
- `static`: whether the property is static or reactive. if static, doesnt trigger updates.
- `meta`: user defined metadata.
- `comparator`: a function that compares the old and new values of the property, default is strict 
equality.

#### example
```typescript
// static
let a = store.create({ value: 1, static: true }).id;
store.effect(() => console.log('a: ', store.get(a)));
store.set(a, 2) // => nothing

// comparator
let b = store.add({ 
	value: { v: 1 }, meta: { prop: 'v' }, 
	comparator (old, New) { return old[this.meta.prop] === New[this.meta.prop] } 
}).id;
store.effect(() => console.log('b.v: ', store.get(b).v));
store.set(b, { v: 2 }) // => b.v: 2
```

## updating
```typescript
export class Store {
	forceUpdate (id: number): void;
	updateAll (withStatic: boolean = true): void;

	onChange: Event<(store: this, props: Prop[]) => void>;
}
```
a property is updated on changes to its value and on definition, or by force.

by default, the comparition to determine if the value has changed is strict equality, but this 
can be changed through `Prop.comparator`.

`forceUpdate`: force trigger an update for a given property.

`updateAll`: trigger update for all properties.   
can be with static properties, by default `true`.

`onChange`: an event triggered on updates, passed with the updated properties.    
this event is triggered on each property change, not once per batch like effects.

#### example
```typescript
store.onChange.listen((store, props) => console.log('updated: ', props.map(prop => prop.id)));

let a = store.signal(1); // => updated: a
a.value = 2; // => updated: a
a.value = 2 // => nothing

store.forceUpdate(a.id) // => updated: a

let b = store.signal(1); // => updated: b
store.updateAll() // => updated: a, b

store.effect(() => b.value = a.value);
let c = this.computed(() => b.value);
a.value = 3;
	// => updated: a
	// => updated: b
	// => updated: c
```

### bulk updating
```typescript
export class Store {
	get bulkUpdating (): boolean;
	startBulkUpdate () : boolean;
	endBulkUpdate (): boolean;
}
```
when setting multiple properties one by one by `set`, each call to `set` triggers an 
independent update.

this can cause overupdates where the common effects between the changed properties is called
by each update.

to solve this, the store provide a mechanism called bulk updating where changes are 
collected and triggered once as a big update.

`bulkUpdating`: whether the store is in a bulk update.

`startBulkUpdate`: starts bulk updating.

`endBulkUpdate`: ends bulk updating.

these methods inc/dec internal counter and only triggers the update when the counter returns to zero. this is implemented to make overlapping batches a single batch.

#### example
```typescript
let a = store.signal(0), b = store.signal(0);
store.addEffect(() => console.log('result: ', a.value + b.value));

a.value = 1; // => result: 1
b.value = 2; // => result: 2

store.startsBulkUpdate();
a.value = 2;
b.value = 3;
store.endBulkUpdate(); // => result: 5

store.startBulkUpdate();
a.value = 3;
{
	store.startBulkUpdate();
	a.value = 4;
	store.endBulkUpdate();
}
b.value = 6;
store.endBulkUpdate(); // => result: 10 
```

## tracking
```typescript
export class Store {
	get isTracking (): boolean;
	startTrack (): void;
	endTrack (): { effecting: number[], effected: number[] };
}
```
manually defining dependencies is not a funny task, and it can be a source of bugs.

to solve this, the store provide a mechanism called tracking where the dependencies are 
tracked automatically.

the tracking tracks the effected (through `set`) and the effecting (through `get`) properties.

`isTracking`: whether the store is in tracking.

`startTrack`: starts tracking.

`endTrack`: ends tracking and return the noticed properties.

#### example
```typescript
let a = store.signal(0), b = store.signal(0);
store.startTrack();

a.value; // effecting
b.value = a + 1; // effected

store.endTrack(); // effecting: [a], effected: [b]
```

## utilities
```typescript
export class Store {
	*[Symbol.iterator] (): Iterator<Prop>;
}
```
`*[Symbol.iterator]`: allows iteration through the properties in `for ... of` loops.