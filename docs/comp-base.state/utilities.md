# utilites
neocomp provide several utilities to simplify state management.

## components 2 way binding
```typescript
export function $in<T> (from: Signal<T>, to: Signal<T>): void;
export function inout<T> (a: Signal<T>, b: Signal<T>, comparator = (a: T, b: T) => a === b): boid;
```
`$in`: one way binds `from` property to `to` property in different data sources.

`$inout`: two way binds the `a` property and the `b` property in different data sources.    
take optionally a `comparator` that compares the value of the two properties.

these methods link the components with each other.    

#### example
```typescript
// A, B: components
let a = A.signal(), b = B.signal();
$in(a, b); // binds A.a -> B.b

inout(a, b); // binds A.a <-> B.b
```

## `Context`
```typescript
export class Context implements DataSource {
	store: Store;
	constructor (storeOptions?: Partial<StoreOptions>);

	get<T = any> (id: PropId<T> | number): T;
	set<T = any> (id: PropId<T> | number, value: T): void;
	has (id: number): boolean;
	signal<T = any> (value?: T): Signal<T>;
	computed<T = any> (fn: () => T): ReadOnlySignal<T>;
	computed<T = any> (effectedBy: EffectingProp[], fn: () => T): ReadOnlySignal<T>;
	effect (handler: () => void): void;
	effect (
		effectedBy: EffectingProp[], effect: EffectedProp[], handler: () => void
	): void;

	unlinkAll (): void;
}
```
`Context`: is a linkable unit that encapsulates independent state. it is used in local and global state management.

`get` and `set`: get and set a given property.

`has`: check if the given property is defined.

`signal`: creates a `Signal` for a new property.

`computed`: creates a computed property and returns a `ReadOnlySignal` of it.

`effect`: add an effect.

`unlinkAll`: unlink all the links with it.

for more details read [fundamentals fundamentals](../comp-base.state/fundamentals.md)

#### example
```typescript
let a = ctx.signal(1);
a.value // => 1

ctx.has(a.id) // => true
ctx.has(0xffff) // => false

let c = ctx.computed(() => a.value + 1); // => 2

ctx.effect(() => console.log(a.value, c.value));

a.value = 2; // => 2, 3
```

## queries
```typescript
export function query <T, E> (store: Store, promise: Promise<T>): ReadOnlySignal<Query<T, E>>;
export function computedQuery <T, E> (store: Store, fn: () => Promise<T>)
	: ReadOnlySignal<ComputedQuery<T, E>>;
export function computedQuery <T, E> (
	store: Store, effectedBy: (number | Signal<any>)[], fn: () => Promise<T>
): ReadOnlySignal<ComputedQuery<T, E>>

export interface Query<T, E> {
	status: 'loading' | 'success' | 'error',
	value?: T,
	error?: E
}
export interface ComputedQuery <T, E> {
	status: 'success' | 'error',
	isLoading: boolean,
	firstTime: boolean,
	value?: T,
	error?: E
}
```
these utilities simplify async states.

`query`: creates and updates a `Query` based on a given promise, returns a readonly signal that holds the query.

`Query`: is a simple object that reflect the status of a promise, it can be of state:
- `loading`: the promise has not resolved yet.
- `success`: the promise has resolved, its resolved value is in `value`.
- ``error`: the promise has rejected, its rejected value is in `error`.

`computedQuery`: creates and updates a `ComputedQuery` based on a given handler, returns a readonly signal that holds the query.      
can be given the properties that effect the query manually.

takes the signal holding the query and the store holding it.

`ComputedQuery`: is a simple object that reflect the status of an async computed value provided by a handler, it consists of:
- `status`: the status of the last resolved value.
- `isLoading`: whether the handler is running.
- `isFirstTime`: whether the handler is running for the first time.
- `value` and `error`: the last resolved value and error, only one exists at a time.

there might be multiple instances of handler running at the same time in a computed query.

#### example
```typescript
const { promise, resolve } = Promise.withResolver<number>();
const query = query(store, promise); // query => { status: 'loading' }
resolve(1); // query => { status: 'success', value: 1 }

const { promise, reject } = Promise.withResolver<number>();
const query = query(store, promise); // query => { status: 'loading' }
reject('error'); // query => { status: 'error', error: 'error' }

const b = store.signal(1);
const query = computedQuery(store, () => { 
	let b = b.value; 
	return new Promise((resolve, reject) => setTimeout(() => {
		if (b > 0) resolve(b);
		else reject('error');
	}, 1000))
});

setTimeout(() => b.value = -1, 500);
setTimeout(() => b.value = 2, 1500);

// 0s => query: { isLoading: true, firstTime: true }
// 0.5s => query: { isLoading: true, firstTime: false }
// 1s => query: { isLoading: true, firstTime: false, status: 'success', value: 1 }
// 1.5s => query: { isLoading: true, firstTime: false, status: 'error', error: 'error' }
// 2.5s => query: { isLoading: false, firstTime: false, status: 'success', value: 2 }
```