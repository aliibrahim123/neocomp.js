# examples and patterns

## basics
### base component
```typescript
class Base extends Component {
	constructor () {
		super();
		const { html } = this.createTop();
		
		html`<div>hallo world</div>`;

		this.fireInit();
	}
}
```

### counter (local state)
```typescript
class Counter extends Component {
	constructor () {
		super();
		const { html } = this.createTop();
		
		let count = this.signal(0);
		html`<button on:click=${() => count.value++}>count: ${count}</button>`;

		this.fireInit();
	}
}
```

### props (constructor args)
```typescript
class Greeting extends Component {
	constructor (name: string, age: number) {
		super();
		const { html } = this.createTop();

		html`<div>hallo ${name}, age: ${age}</div>`;

		this.fireInit();
	}
}

// usage
html`${new Greeting('alex', 25)}`;
```

## flow control
### conditional rendering
```typescript
// static
if (someCond) html`<div>content A</div>`;
else html`<div>content B</div>`;

// dynamic
let active = this.signal(false);
html`<div ${showIf(active)}>active content</div>`;
```

### list rendering
```typescript
// static
for (let i = 0; i < 10; i++) html`<div>${i}</div>`;

// dynamic
let list = this.signal([1, 2, 3]);
html`<div ${renderList(list, ({ html }, item) => 
	html`<div>${item}</div>`
)}/>`;
```

### switch case
```typescript
let status = this.signal('loading'); // loading, error, success

html`<div ${showIf(() => status.value === 'loading')}>...</div>`;
html`<div ${showIf(() => status.value === 'error')}>error</div>`;
html`<div ${showIf(() => status.value === 'success')}>success</div>`;
```

## dom interaction
### node reference
```typescript
let el;
html`<div ${node => el = node}>`;
```

### actions (directives)
```typescript
const clickOutside = (callback: () => void) => (el: HTMLElement) => {
	document.addEventListener('click', e => {
		if (!el.contains(e.target as Node)) callback();
	});
};

const bindChecked = (signal: Signal<boolean>) => ({
	'on:change': (el: HTMLInputElement) => signal.value = el.checked
})

// usage
html`<div ${clickOutside(() => console.log('clicked outside'))}></div>`;
html`<input ${bindChecked(checked)}/>`;
```

### dynamic styling
```typescript
let active = this.signal(false);
let color = this.signal('red');

html`<div class:is-active=${active} style:color=${color}>styled content</div>`;
```

### portals
```typescript
class Modal extends Component {
	constructor (content: string) {
		super();
		
		const { html, remove, end } = this.view.createChunk(undefined, true);
		html`<div class="modal">${content}</div>`;
		document.body.append(end());
		
		this.onRemove.listen(remove);
		this.fireInit();
	}
}
```

### input binding
```typescript
let text = this.signal('');
html`<input on:input=${el => text.value = el.value}>`;
```

## composition
### children
```typescript
class Child extends Component {
	constructor (name: string) {
		super();
		this.createTop().html`<div>i am ${name}</div>`;
		this.fireInit();
	}
}

class Parent extends Component {
	constructor () {
		super();
		const { html } = this.createTop();
		html`<div>
			${new Child('a')}
			${new Child('b')}
		</div>`;
		this.fireInit();
	}
}
```

### sections (sub-views)
```typescript
class Comp extends Component {
	constructor () {
		super();
		
		// inline
		const section = (text: string) => html`<span>${text}</span>`;
		
		section('hello');
		this.#private(html, 'world');
		html`${external('!')}`;

		this.fireInit();
	}

	#private (html: html) {
		html`<span>${text}</span>`;
	}
}

const external = (text: string) => snippet(({ html }) => 
	html`<span>${text}</span>`
);
```

### wrapper pattern
```typescript
class Wrapper extends Component {
	constructor (el: HTMLElement, title: string) {
		super();
		const { html } = this.createTop();
		
		html`<div class="box">
			<h1>${title}</h1>
			<div>${el.childNodes}</div>
		</div>`;

		this.fireInit();
	}
}

// usage
html`<div ${wrapWith(Wrapper, 'example')}>content</div>`;
```

### slots
```typescript
class Compose extends Component {
	constructor (title: string, body: (build: ChunkBuild) => void) {
		super();
		let build = this.createTop();
		let { html } = build;
		html`<div>`;
		
		html`<h3>${title}</h3>`;
		body(build);
		
		html`</div>`;
		this.fireInit();
	}
}

// usage
new Compose('Title', ({ html }) => html`<div>body content</div>`);
```

## state management
### computed properties
```typescript
let count = this.signal(1);
let double = this.computed(() => count.value * 2);

html`<div>${count} * 2 = ${double}</div>`;
```

### shared state (context)
```typescript
let themeCtx = new Context();
let isDark = themeCtx.signal(false);

class ThemeToggler extends Component {
	constructor() {
		super();
		this.link(themeCtx); 
		let { html } = this.createTop();
		html`<button on:click=${() => isDark.value = !isDark.value}>toggle</button>`;
		this.fireInit();
	}
}

class App extends Component {
	constructor() {
		super();
		this.link(themeCtx);
		let { html } = this.createTop();
		html`<div style:background=${() => isDark.value ? '#333' : '#fff'}></div>`;
		this.fireInit();
	}
}
```

### inter-component comms
```typescript
class Child extends Component {
	constructor (fromParent: Signal<string>, twoWay: Signal<string>) {
		super();
		let local1 = this.signal(), local2 = this.signal();
		$in(fromParent, local1);
		inout(twoWay, local2);
	}
}
```

## async & performance
### async regions
```typescript
html`${$async(this, async ({ html }, fallback) => {
	fallback(this.$chunk`<span>waiting</span>`);

	let data = await (await fetch('...')).text();
	html`<div>${data}</div>`;
})}`;
```

### async state
```typescript
let query = query(this.store, fetch('...').then(r => r.text()));

html`<div ${showIf(() => query.value.status === 'loading')}>waiting</div>`;
html`<div ${showIf(() => query.value.status === 'success')}>
	value: ${() => query.value.value}
</div>`;
```

### lazy loading
```typescript
// heavy.ts
class Heavy extends Component {}
registry.add('heavy', Heavy);

// main.ts
html`${new (registry.get('@lazy:heavy'))}`;
import('./heavy'); 
```

## architecture
### lifecycle
```typescript
class Comp extends Component {
	constructor () {
		super();
		let interval = setInterval(() => console.log('tick'), 1000);
		this.onRemove.listen(() => clearInterval(interval));
		this.fireInit();
	}
}
```

### router + root
```typescript
const router = new ZRORouter();

router.onAfterUpdate.listen(() => {
	registry.removeRoot();
	let rootEl = document.getElementById('root');
	// assumes root el has attribute 'comp="page1"'
	let Class = registry.get(rootEl.getAttribute('comp'));
	registry.setRoot(new Class(rootEl));
});
```