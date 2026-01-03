# basic state management
reactive states are the core of neocomp.

states are stored in `Store` units, units that manage state storage and updating.

## fundamentals of states
### `Signal`
```typescript
class Example extends Component {
	count = this.signal(0);
	increment () {
		this.count.value++;
	}
}
```
`Signal` is a wrapper around a reactive property, it constains a `value` field that reflect the property value. 

it is created by calling `Component.signal` with an optional default value and can be passed as normal value.

### effects
```typescript
class Example extends Component {
	constructor (el: HTMLElement) {
		let count = this.signal(0);
		let countPlus1 = this.signal(0);
		this.effect(() => console.log(count.value));
		this.effect(() => countPlus1.value = count.value + 1);
	}
}
```
effects are functions that are called when a given properties change.

effects can also effect other properties, then the reactivity cascades.

they dependencies are detected automatically.

### `computed`
```typescript
class Example extends Component {
	count = this.signal(0);
	countPlus1 = this.computed(() => this.count.value + 1);
}
```
`computed` is a function that creates a `Signal` for a state that dependeds on other states.

it is called with a function that returns the computed value and it is called when the dependencies change.

## honorable mentions
- **`Context`**: an independable unit that contains its own state, usefull for intercomponent communication.

- **bulk update**: group multiple updates in a single batch

- **`$in` and `inout`**: to establish a unidirectional or bidirectional binding between components.

- **`query` and `computedQuery`**: utilities for async states.

---
next steps [templates](./templates.md)