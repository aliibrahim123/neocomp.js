# utilites
neocomp provide several utilities to simplify state management.

## components 2 way binding
```typescript
export function $in<From extends PureComp, To extends PureComp> (
	from: From, fromProp: EffectedProp<getProps<From>>,	to: To, toProp: EffectedProp<getProps<To>>
): void
export function inout<A extends PureComp, B extends PureComp, T> (
	a: A, aProp: EffectedProp<getProps<A>>, b: B, bProp: EffectedProp<getProps<B>>,
	comparator = (a: T, b: T) => a === b
): void
```
`$in`: one way binds `fromProp` property in `from` component to `toProp` property in `to` 
component.

`$inout`: two way binds the `aProp` property in `a` and the `bProp` property in `b`.    
take optionally a `comparator` that compares the value of the two properties.

these methods link the components with each other.    
the properties can be property name, symbol or signal wrapping it.

#### example
```typescript
// a, b: Components<{ props: { a: number; b: number } }>
$in(a, 'a', b, b.signal('b')); //binds a.a -> b.b

inout(a, 'a', b, b.signal('b')); //binds a.a <-> b.b
```

## `Context`
```typescript
export class Context <Props extends Record<string, any>> implements Linkable {
	store: Store<Props>;
	constructor (props: Partial<Props>, storeOptions?: Partial<StoreOptions>);

	get <P extends keyof Props> (name: P | symbol): Props[P]
	set <P extends keyof Props> (name: P | symbol, value: Props[P]): void;
	setMuliple (props: Partial<Props>): void;
	has (name: keyof Props | symbol): boolean;
	signal <P extends keyof Props> (name: P | symbol, Default?: Props[P]): Signal<Props[P]>;
	computed <P extends keyof Props> (
		name: P | symbol, effectedBy: EffectedProp<Props>[] | 'track', fn: () => Props[P]
	): ReadOnlySignal<Prop<P>>;
	effect (
		effectedBy: EffectedProp<Props>[], handler: () => void,
		effect?: EffectedProp<Props>[]
	): void;
	effect (track: 'track', handler: () => void): void;

	unlinkAll (): void;
}
```
`Context`: is a linkable unit that encapsulates independent state.

it is used in local and global state management.

it is constructed from an optional properties and `StoreOptions`.

`get` and `set`: get and set a given property.

`has`: check if the given property is defined.

`setMultiple`: set multiple properties at once.

`signal`: creates a `Signal` of a given property.

`computed`: creates a computed property and returns a `ReadOnlySignal` of it.

`effect`: add an effect effected by and effecting a given properties.

`unlinkAll`: unlink all the links with it.

for more details read [fundamentals fundamentals](../comp-base.state/fundamentals.md)

#### example
```typescript
comp.set('a', 1);
comp.get('a') // => 1

comp.has('a') // => true
comp.has('unknown') // => false

comp.setMultiple({ b: 2, c: 3 });

const a = comp.signal('a');

const d = comp.computed('d', 'track', () => a.value + 1); // => 2

comp.effect('track', () => console.log(a.value, d.value));

a.value = 2; // => 2, 3
```

## queries
```typescript
export function query <T, E> (signal: Signal<Query<T, E>>, promise: Promise<T>): Query<T, E>;
export function computedQuery <Props extends Record<string, any>, T, E> (
	store: Store<Props>, signal: Signal<Query<T, E>>, 
	effectedBy: EffectedProp<Props>[] | 'track', fn: () => Promise<T>
): ComputedQuery<T, E>;

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

`query`: creates and updates a `Query` based on a given promise, takes the signal that holds the 
query.

`Query`: is a simple object that reflect the status of a promise, it can be of state:
- `loading`: the promise has not resolved yet.
- `success`: the promise has resolved, its resolved value is in `value`.
- ``error`: the promise has rejected, its rejected value is in `error`.

`computedQuery`: creates and updates a `ComputedQuery` based on a given handler, takes the signal
holding the query and the store holding it.

`ComputedQuery`: is a simple object that reflect the status of an async computed value provided by a handler, it consists of:
- `status`: the status of the last resolved value.
- `isLoading`: whether the handler is running.
- `isFirstTime`: whether the handler is running for the first time.
- `value` and `error`: the last resolved value and error, only one exists at a time.

there might be multiple instances of handler running at the same time in a computed query.

#### example
```typescript
//a, b, c: signals
const { promise, resolve } = Promise.withResolver<number>();
const query = query(a, promise); // a => { status: 'loading' }
resolve(1); // a => { status: 'success', value: 1 }

const { promise, reject } = Promise.withResolver<number>();
const query = query(a, promise); // a => { status: 'loading' }
reject('error'); // a => { status: 'error', error: 'error' }

b.value = 1;
const computedQuery = computedQuery(store, c, [b], 
	() => new Promise((resolve, reject) => setTimeout(() => {
		if (b > 0) resolve(b.value);
		else reject('error');
	}, 1000))
);

setTimeout(() => b.value = -1, 500);
setTimeout(() => b.value = 2, 1500);

// 0s => c: { isLoading: true, firstTime: true }
// 0.5s => c: { isLoading: true, firstTime: false }
// 1s => c: { isLoading: true, firstTime: false, status: 'success', value: 1 }
// 1.5s => c: { isLoading: true, firstTime: false, status: 'error', error: 'error' }
// 2.5s => c: { isLoading: false, firstTime: false, status: 'success', value: 2 }
```