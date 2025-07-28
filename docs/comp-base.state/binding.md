## effects
```typescript
export class Store <Props> {
	addEffect (
	  effectedBy: (keyof Props | symbol)[], handler: (this: EffectUnit) => void,
	  effect: (keyof Props | symbol)[]?, from?: Linkable, meta?: object
	): void
}
```
an effect is a listener for a given properties that can also change other properties.

`addEffect` adds an effect effected by `effectedBy` properties and effect `effect` properties.

can be given a `Linkable` that added the effect in `from` and any `object` as `meta`.

## `UpdateDispatcher`
every `Store` contains an `UpdateDispatcher`.   
the update dispatcher is an object responsible for dispatching the updates.

### how it works
it listens for property changes and call the respectfull events.

it avoids overupdating by collecting the depedencies between effects and calling an effect
when all of its depedencies is resolved.

if all the depedencies between effects are known at start, no effect effect properties not
listed in its definition, each effect will be called one time only.

this system is programed since of the overupdate issues.   
in naive solution, if n effects change the same property, all the effects effected that 
property will run n times, and this can grow exponantially.

it is undefined which event win when 2 or more events update the same property.

### constructor and options
```typescript
export class Store<Props> {
	dispatcher: UpdateDispatcher;
}

export class UpdateDispatcher {
	constructor (store: Store<any>, options: Partial<UDispatcherOptions>?);
	options: UDispatcherOptions;
	static defaults: UDispatcherOptions;
}

export interface UDispatcherOptions {
	balance: boolean = true;
}
```
`constructor` takes a `Store` and options and construct a `UpdateDispatcher`.

#### `UDispatcherOptions`
- `balance`: whether to balance the updates, use the system explained above or use the naive 
solution.

### effect managment
```typescript
export class UpdateDispatcher {
	add (
		effectedBy: symbol[], effect: symbol[], handler: (this: EffectUnit) => void,
		from?: Linkable, meta?: object
	): void;

	update (props: symbol[]): void;

	remove (fn: (unit: EffectUnit) => boolean, props?: symbol[]): void;
}

export interface EffectUnit {
	effect: symbol[],
	effectedBy: symbol[],
	handler: () => void,
	from: Linkable | undefined,
	meta: object
}
```
`add`: add an effect, same as `Store.addEffect` but the properties arguments are only property
symbols.

`EffectUnit`: `add` method arguments turned into interface.

`update`: update the given properties, can be called during dispatching.

`remove`: filter the effects, take a function that take `EffectUnit` and return `true` to 
remove the `EffectUnit` and `false` to keep.    
can be passed an `Array` of properties to filter.

## components state 2 way binding
```typescript
export function $in<From extends PureComp, To extends PureComp> (
  from: From, fromProp: keyof getProps<From> | symbol,
  to: To, toProp: keyof getProps<To> | symbol
): void;
export function $inout<A extends PureComp, B extends PureComp, T> (
  a: A, aProp: keyof getProps<A> | symbol, 
  b: B, bProp: keyof getProps<B> | symbol,
  comparator?: (a: T, b: T) => boolean
): void;
```
`$in`: one way binds `fromProp` in `from` component to `toProp` in `to` component.

`$inout`: two way binds the `aProp` in `a` and the `bProp` in `b`.    
take optionally a `comparator` that compares the value of the two properties.

**note:** these methods link the components with each other.

## `Context`
```typescript
export class Context <Props extends Record<string, any>> implements Linkable {
	store: Store<Props>;
	constructor (props: Partial<Props>, storeOptions?: Partial<StoreOptions>);

	get <P extends keyof Props> (name: P | symbol): Props[P]
	set <P extends keyof Props> (name: P | symbol, value: Props[P]): void;
	signal <P extends keyof Props> (name: P | symbol, Default?: Props[P]): Signal<Props[P]>;
	effect (
		effectedBy: (keyof Props | symbol)[], handler: () => void,
		effect?: (keyof Props | symbol)[], from?: Linkable
	): void;

	unlinkAll (): void;
}
```
`Context`: is a `Linkable` unit that contains state in a `Store`.

it is constructed from an optional properties and `StoreOptions`.

`get` and `set`: get and set a given property.

`signal`: creates a `Signal` of a given property.

`effect`: add an effect effected by and effecting a given properties.   
can be passed with the `Linkable` adding the effect in `from`.

**note**: all the given methods are type safe.

**more info**: read state [accessing](../comp-base.state/accessing.md) and 
[binding](../comp-base.state/binding.md).

`unlinkAll`: unlink all the links with it.