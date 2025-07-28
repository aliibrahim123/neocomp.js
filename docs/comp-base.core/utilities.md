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

export function tryLink (a: Linkable, b: Linkable): void;
export function tryUnlink (a: Linkable, b: Linkable): void;
```
a `Linkable` is an interface that represent a unit that can be link to another `Linkable`.

it simplifies dependecies management by standardizing and automating it.

### `Linkable` methods
`link`: add a linkable to the links.

`unlink`: remove a linkable from the links.

`hasLink`: check if a linkable is in links.

`onLink`: an event triggered when linking a linkable.

`onUnlink`: an event triggered when unlinking a linkable.

### linking funtions
`link`: links two linkable togather.

`unlink`: unlinks two linkable from each other.

`tryLink`: try linking two linkable if they are not already linked.

`tryUnlink`: try unlinking two linkable if they are already linked.

the linking method on linkable do a one way link, while these do two way link.   
use these for linking.

# events
events are common objects in neocomp and used in different modules.

they are units that can be subscribed to and triggered.

exported by `comp-base`

## `Event` class
```typescript
export class Event <Listener extends (...args: any[]) => any> {
	listen (listener: Listener): void;
	unlisten (listener: Listener): void;
	trigger (...args: Parameters<Listener>): void;
	once (listener: Listener): void;
	async awaitForIt (): Promise<Parameters<Listener>>;
}
```
represent a normal event that can be subscribed to.

`listen`: adds a listener to the event.

`unlisten`: remove a listener to the event.

`once`: add a listener to the event and remove it on the first trigger after subscription.

`trigger`: trigger the event and call listeners with the passed arguments.

`awaitForIt`: return a `Promise` that resolve on the first trigger after subscription with the 
passed arguments.

#### example
```typescript
const event = new Event<(a: number, b: number) => void>();

event.listen((a, b) => console.log(a, b));
event.trigger(1, 2); // => 1 2

event.unlisten((a, b) => console.log(a, b));
event.trigger(1, 2); // => nothing

event.once((a, b) => console.log(a, b));
event.trigger(1, 2); // => 1 2
event.trigger(1, 2); // => nothing

(async () => {
	console.log(await event.awaitForIt());
})();
setTimeout(() => event.trigger(1, 2), 100); // => [1, 2]
setTimeout(() => event.trigger(1, 2), 200); // => nothing
```

## `OTIEvent` class
```typescript
export class OTIEvent <Listener extends (...args: any[]) => any> {
	listen (listener: Listener): void;
	unlisten (listener: Listener): void;
	trigger (...args: Parameters<Listener>): void;
	once (listener: Listener): void;
	async awaitForIt (): Promise<Parameters<Listener>>;
}
```
behaive like normal `Event`, but can be triggered only once.

`listen`: add a listener to the event, and after trigger it starts calling the listener immediately.

`trigger`: allowed once.

#### example
```typescript
const event = new OTIEvent<(a: number, b: number) => void>();

event.listen((a, b) => console.log(a, b));
event.trigger(1, 2); // => 1 2
event.listen((a, b) => console.log(a, b)); // => 1 2

event.trigger(1, 2) // => throw error

await event.awaitForIt(); // [1, 2] immediately
```

## utilities
```typescript
export function listenUntil <listener extends fn>
  (source: Event<fn>, target: Event<listener>, listener: listener): void;
```
`listenUntil` add the listener to the target event and remove it when the source event is triggered.

#### example
```typescript
const event = new Event<(a: number, b: number) => void>();
const onRemove = new Event<() => void>();

listenUntil(onRemove, event, (a, b) => console.log(a, b));

event.trigger(1, 2); // => 1 2
onRemove.trigger();
event.trigger(1, 2); // => nothing
```

# errors
```typescript
export class CompError extends Error { }

type ErrorLevel = 'ignore' | 'warn' | 'error' | 'debug';

export const errorsLevels = { 
	base: ErrorLevel = 'error'
	[key: `Err${number}`]?: ErrorLevel
}	
```
`CompError` is the error type used in neocomp.

`errorsLevels` is a record that define for each error by its error code its `ErrorLevel`, it can 
be:
- `ignore`: ignore the error, maybe the error can not be ignore and the app break in another way.
- `warn`: log into the console a warning message, do not pause the app, but like `ignore` can be
breaked by another way.
- `error`: throw an error and pause the app.
- `debug`: throw an error, pause the app and open the debugger at the error breakpoint.