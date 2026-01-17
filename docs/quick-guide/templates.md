# templates
```typescript
class Example extends Component {
	constructor (el?: HTMLElement) {
		// ...

		const { html } = this.createTop();
		let count = this.signal(0);
		html`<div>hallo world ${count} times`;
		html`<button on:click=${() => count.value++}>inc</button>`;
		html`</div>`
		// ...
	}
}
```
ui in components is build initially on creation, and then updated through fine grained reactivity.

it is defined as chunks of html structure scattered between logic, where every chunk is defined between its assocciated logic, as opposite to other frameworks were the entire structure is defined at the end.

these chunks are defined through `html` tagged template, they can set / bind specified values to specified attributes and content through placeholders.

## placeholders
placeholders are embedded expressions defined through `${exp}`, they can be of different kinds:

- **attribute**: where the evaluated value is set to an attribute.    
these placeholders can target other than ordinary attributes, like `class:name`, `style:prop`, and `on:event`.
```typescript
html`<div id=${randomID()} class:active=${active}>`
```
- **action**: these placeholders are defined inside the element takes, they run a passed function on the target element, or take an object of attributes.
```typescript
html`<div ${console.log} ${{ id: 'some-div' }}>`
```

- **content**: defined as content of an element, their evaluated value is inserted into the DOM.
```typescript
html`<div>count: ${count}</div>`
```

placeholder accept normal values that are set as static content, additionally they accept signals and computed exprissions in functions for dynamic content.
```typescript
let count = this.signal(0);
html`statics: ${'like me'} ${someCond ? 1 : 2}`;
html`dynamics: ${count} ${() => count.value + 1}`
```