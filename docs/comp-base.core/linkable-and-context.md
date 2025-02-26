## `Linkable`
```typescript
export interface Linkable {
	onLink: Event<(self: any, other: Linkable) => void>;
	onUnlink: Event<(self: any, other: Linkable) => void>;
	link (other: Linkable): void;
	unlink (other: Linkable): void;
	hasLink (other: Linkable): boolean;
}

export function link (a: Linkable, b: Linkable): void; 
export function unlink (a: Linkable, b: Linkable): void;
```
a `Linkable` is an interface that represent a unit that can be link to another `Linkable`.

it simplifies dependecies management by standardizing it.

### `Linkable` fields
`link`: add a `Linkable` to the links.

`unlink`: remove a `Linkable` from the links.

`hasLink`: check if a `Linkable` is in links.

`onLink`: an event triggered on linking a `Linkable`.

`onUnlink`: an event triggered on unlinking a `Linkable`.

### linking methods
`link`: links 2 `Linkable` togather.

`unlink`: unlinks 2 `Linkable` from each other.

**note:** the linking method on `Linkable` do a one way link, while these do two way link.   
use these for linking.

## `Resource`
```typescript
export class Resource <T> implements Linkable {
	value: T;
	constructor (value: T);

	unlinkAll (): void;
}
```
`Resource`: is a `Linkable` wrapper around a value.   
it is used for dependecies that doesnt implement `Linkable`.

`unlinkAll`: unlink all the links with it.

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