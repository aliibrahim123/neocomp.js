# events
events are common objects in neocomp and used in different modules.

## `Event` class
```typescript
export class Event <Listener extends (...args: any[]) => any> {
	on (listener: Listener): this;
	off (listener: Listener): this;
	trigger (...args: Parameters<Listener>): this;
	once (listener: Listener): this;
	async awaitForIt (): Promise<Parameters<Listener>>; 
}
```
represent a normal event that can be subscribed to.

`on`: adds a listener to the event.

`off`: remove a listener to the event.

`once`: add a listener to the event and remove it on the first trigger after subscription.

`trigger`: trigger the event and call listeners with the passed arguments.

`awaitForIt`: return a `Promise` that resolve on the first trigger after subscription.

## `OTIEvent` class
```typescript
export class Event <Listener extends (...args: any[]) => any> {
	on (listener: Listener): this;
	off (listener: Listener): this;
	trigger (...args: Parameters<Listener>): this;
	once (listener: Listener): this;
	async awaitForIt (): Promise<Parameters<Listener>>; 
}
```
like normal events but only trigger once and after that call the listener once on subscription