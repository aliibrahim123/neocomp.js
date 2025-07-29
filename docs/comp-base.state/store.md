# `Store`
`Store` is a unit that connects to a `Linkable` and manage its states.

it is responsible for state storage and updating.

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
`constructor`: take a linkable as a `base` and optional `StoreOptions`.

`base`: is the linkable the store is attached to.

`options`: is the `StoreOptions` defined for this store.

`defaults`: is the default options defined for all instances of the `Store`.

### `StoreOptions`
- `static`: all properties are static by default, doesnt trigger updates. default, all 
properties are reactive.
- `addUndefined`: allow the addition of undefined properties, through `set` not by 
`add`, default is to disallow.
- `baseProp`: the base definition for all properties.
- `updateOnDefine`: enable initial update dispatch on property definition, default `true`.
- `updateOnSet`: trigger update on property setting, default `true`.
- `updateDispatcher`: the options passed to the update dispatcher.

## state management
```typescript
export class Store {
	add <P extends keyof Props> (name: P, propObj?: Partial<Prop<Props[P]>>): Prop<Props[P]>;
	has (name: keyof Props | symbol): boolean;
	remove (name: keyof Props | symbol): void;

	getProp <P extends keyof Props> (name: P | symbol): Prop<Props[P]>;
	getSymbolFor (name: keyof Props): symbol;

	onAdd: Event<(store: this, prop: Prop<any>) => void>;
	onRemove: Event<(store: this, prop: Prop<any>) => void>;
}
```
see also [fundamentals](./fundamentals.md)

`add`: add a given property, optionally take a property definition.

`has`: whether the store has the given property defined.

`remove`: remove a property from the store.

`getProp`: get the definition of a given property.

`getSymbolFor`: get the symbol of a given property. if not defined, returns a future valid
property symbol.

if `options.addUndefined` is `false`, after using `getSymbolFor`, setting the property doesnt 
throw errors.

`onAdd`: an event triggered when adding a property.

`onRemove`: an event triggered when removing a property.

#### example
```typescript
store.onAdd.listen((store, prop) => console.log('added: ', prop.name));
store.onRemove.listen((store, prop) => console.log('removed: ', prop.name));

store.has('a') // => false
store.add('a', { value: 1 }) // => addded: a
store.has('a') // => true

store.getProp('a').value // => 1

store.getSymbolFor('a') // => Symbol(neocomp:prop(a))
store.has('b') // => false
store.getSymbolFor('b') // => Symbol(neocomp:prop(b))

store.remove('a') // => removed: a
```

### `Prop`
```typescript
export interface Prop <T> {
	value: T;
	name: string;
	symbol: symbol;
	isStatic: boolean;
	meta: Record<keyof any, any>;
	setter?: (this: this, value: T, store: Store<any>) => void;
	getter?: (this: this, store: Store<any>) => T;
	comparator: (old: T, New: T, store: Store<any>) => boolean;
}
```
the definition of the property, it contains:
- `name`: the property name.
- `symbol`: the property symbol.
- `value`: the property value.
- `isStatic`: whether the property is static or reactive. if static, doesnt trigger updates.
- `meta`: user defined metadata.
- `getter`: a function called to get the value of the property.
- `setter`: a function called to set the value of the property.
- `comparator`: a function that compares the old and new values of the property, default is strict 
equality.

#### example
```typescript
// getter and setter
store.add('a', { value: 1, 
	getter () { return this.value * 2 }, setter (value) { this.value = value / 2 } 
});

store.get('a') // => 2
store.set('a', 4) // => a.value: 2

// static
store.add('b', { value: 1, isStatic: true });
store.addEffect('track', () => console.log('b: ', store.get('b')));
store.set('b', 2) // => nothing

// comparator
store.add('c', { 
	value: { v: 1 }, meta: { prop: 'v' }, 
	comparator (old, New) { return old[this.meta.prop] === New[this.meta.prop] } 
});
store.addEffect('track', () => console.log('c.v: ', store.get('c').v));
store.set('c', { v: 2 }) // => c.v: 2
```

## updating
```typescript
export class Store {
	forceUpdate (name: keyof Props | symbol): void;
	updateAll (withStatic: boolean = true): void;

	onChange: Event<(store: this, props: Prop<any>[]) => void>;
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
store.onChange.listen((store, props) => console.log('updated: ', props.map(prop => prop.name)));

store.add('a', { value: 1 }) // => updated: a
store.set('a', 2) // => updated: a
store.set('a', 2) // => nothing

store.forceUpdate('a') // => updated: a

store.set('b', 1) // => updated: b
store.updateAll() // => updated: a, b

store.effect('track', () => store.set('c', store.get('a')));
store.effect('track', () => store.set('c', store.get('b')));
store.effect('track', () => console.log('c updated');
store.setMultiple({ a: 2, b: 3 }) 
	// => updated: a, b
	// => updated: c
	// => updated: c
	// => c updated
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

these methods inc/dec internal counter and only triggers the update when the 
counter returns to zero.   
this is implemented to make overlapping batches a single batch.

`setMultiple` triggers a bulk update internally.

#### example
```typescript
//a, b: signals initially 0
store.addEffect('track', () => console.log('result: ', a.value + b.value));

a.value = 1; // => result: 1
b.value = 2; // => result: 3

store.startsBulkUpdate();
a.value = 2;
b.value = 3;
store.endBulkUpdate(); // => result: 5

startBulkUpdate();
a.value = 3;
store.setMultiple({ a: 4, b: 5 }); // a bulk update starts and ends here, but there is no effect
b.value = 6;
store.endBulkUpdate(); // => result: 10 
```

## tracking
```typescript
export class Store {
	get isTracking (): boolean;
	startTrack (): void;
	endTrack (): { effecting: symbol[], effected: symbol[] };
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
store.startTrack();

const a = store.get('a'); // effecting
store.set('b', a + 1); // effected

store.endTrack(); // effecting: [a], effected: [b]
```

## utilities
```typescript
export class Store {
	*[Symbol.iterator] (): Iterator<Prop<any>>;
}
```
`*[Symbol.iterator]`: allows iteration through the properties in `for ... of` loops.