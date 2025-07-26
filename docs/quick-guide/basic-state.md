# basic state management
reactive states are the core of neocomp.

states are stored in `Store` units, units that manage state storage and updating.

for typesafety, state types are declared in `TypeMap.props`.
```typescript
interface TypeMap extends BaseMap {
	props: {
		name: string,
		count: number
	}
}
```

## fundamentals of states
### `get` and `set`
```typescript
class Example extends Component<TypeMap> {
	increment () {
		this.set('count', this.get('count') + 1);
	}
}
```
`get` and `set` are the fundamental way of accessing state, used internally by all systems.

### `Signal`
```typescript
class Example extends Component<TypeMap> {
	count = this.signal('count', 0);
	increment () {
		this.count.value++;
	}
}
```
`Signal` is a wrapper around a property that can be passed as normal value.

they are created calling `Component.signal` with the property name and an optional default value.

they contains a `value` field that reflect the property value.

they are the recommended way of using state.

### effects
```typescript
class Example extends Component<TypeMap> {
	constructor (el: HTMLElement) {
		//...
		this.effect(['count'], () => console.log(this.count.value));
		//effect other properties
		this.effect(['count'], () => this.set('countPlus1', this.count.value + 1), ['countPlus1']);
		//auto detect dependencies
		this.effect('track', () => this.set('countPlus2', this.count.value + 2));
	}
}
```
effects are functions that are called when a given properties change.

effects can also effect other properties, then the reactivity cascades.

they dependencies are passed manually, or can be auto detected like the example.

### `computed`
```typescript
class Example extends Component<TypeMap> {
	count = this.signal('count', 0);
	countPlus1 = this.computed('countPlus1', 'track', () => this.count.value + 1);
}
```
`computed` is a function that create a `Signal` for a state that dependeds on other states.

the dependencies are passed manually, or can be auto detected like the example.

## honorable mentions
- **`Context`**: an independable unit that contains its own state, usefull for intercomponent communication.

- **bulk update**: group multiple updates in a single batch through `Store.setMultiple` and others.

- **`$in` and `inout`**: to establish a unidirectional or bidirectional binding between components.

- **`query` and `computedQuery`**: utilities for async states.

---
next steps [templates](./templates.md)