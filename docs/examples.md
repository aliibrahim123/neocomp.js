# examples and patterns

## basics
### base component
```typescript
class Base extends Component {
	constructor () {
		super();
		const { $temp } = this.createTop();
		
		$temp`<div>hallo world</div>`;

		this.fireInit();
	}
}
```

### counter (local state)
```typescript
class Counter extends Component {
	constructor () {
		super();
		const { $temp } = this.createTop();
		
		let count = this.signal(0);
		$temp`<button on:click=${() => count.value++}>count: ${count}</button>`;

		this.fireInit();
	}
}
```

### props (constructor args)
```typescript
class Greeting extends Component {
	constructor (name: string, age: number) {
		super();
		const { $temp } = this.createTop();

		$temp`<div>hallo ${name}, age: ${age}</div>`;

		this.fireInit();
	}
}

// usage
$temp`${new Greeting('alex', 25)}`;
```

## flow control
### conditional rendering
```typescript
// static
if (someCond) $temp`<div>content A</div>`;
else $temp`<div>content B</div>`;

// dynamic
let active = this.signal(false);
$temp`<div ${showIf(active)}>active content</div>`;
```

### list rendering
```typescript
// static
for (let i = 0; i < 10; i++) $temp`<div>${i}</div>`;

// dynamic
let list = this.signal([1, 2, 3]);
$temp`<div ${renderList(list, ({ $temp }, item) => 
	$temp`<div>${item}</div>`
)}/>`;
```

### switch case
```typescript
let status = this.signal('loading'); // loading, error, success

$temp`<div ${showIf(() => status.value === 'loading')}>...</div>`;
$temp`<div ${showIf(() => status.value === 'error')}>error</div>`;
$temp`<div ${showIf(() => status.value === 'success')}>success</div>`;
```

## dom interaction
### node reference
```typescript
let el;
$temp`<div ${node => el = node}>`;
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
$temp`<div ${clickOutside(() => console.log('clicked outside'))}></div>`;
$temp`<input ${bindChecked(checked)}/>`;
```

### dynamic styling
```typescript
let active = this.signal(false);
let color = this.signal('red');

$temp`<div class:is-active=${active} style:color=${color}>styled content</div>`;
```

### portals
```typescript
class Modal extends Component {
	constructor (content: string) {
		super();
		
		const { $temp, remove, end } = this.view.createChunk(undefined, true);
		$temp`<div class="modal">${content}</div>`;
		document.body.append(end());
		
		this.onRemove.listen(remove);
		this.fireInit();
	}
}
```

### input binding
```typescript
let text = this.signal('');
$temp`<input on:input=${el => text.value = el.value}>`;
```

## composition
### children
```typescript
class Child extends Component {
	constructor (name: string) {
		super();
		this.createTop().$temp`<div>i am ${name}</div>`;
		this.fireInit();
	}
}

class Parent extends Component {
	constructor () {
		super();
		const { $temp } = this.createTop();
		$temp`<div>
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
		const section = (text: string) => $temp`<span>${text}</span>`;
		
		section('hello');
		this.#private($temp, 'world');
		$temp`${external(comp, '!')}`;

		this.fireInit();
	}

	#private ($temp: $temp) {
		$temp`<span>${text}</span>`;
	}
}

const external = (comp: Component, text: string) => comp.chunk(({ $temp }) => 
	$temp`<span>${text}</span>`
);
```

### wrapper pattern
```typescript
class Wrapper extends Component {
	constructor (el: HTMLElement, title: string) {
		super();
		const { $temp } = this.createTop();
		
		$temp`<div class="box">
			<h1>${title}</h1>
			<div>${el.childNodes}</div>
		</div>`;

		this.fireInit();
	}
}

// usage
$temp`<div ${wrapWith(Wrapper, 'example')}>content</div>`;
```

### slots
```typescript
class Compose extends Component {
	constructor (title: string, body: (build: ChunkBuild) => void) {
		super();
		let build = this.createTop();
		let { $temp } = build;
		$temp`<div>`;
		
		$temp`<h3>${title}</h3>`;
		body(build);
		
		$temp`</div>`;
		this.fireInit();
	}
}

// usage
new Compose('Title', ({ $temp }) => $temp`<div>body content</div>`);
```

## state management
### computed properties
```typescript
let count = this.signal(1);
let double = this.computed(() => count.value * 2);

$temp`<div>${count} * 2 = ${double}</div>`;
```

### shared state (context)
```typescript
let themeCtx = new Context();
let isDark = themeCtx.signal(false);

class ThemeToggler extends Component {
	constructor() {
		super();
		this.link(themeCtx); 
		let { $temp } = this.createTop();
		$temp`<button on:click=${() => isDark.value = !isDark.value}>toggle</button>`;
		this.fireInit();
	}
}

class App extends Component {
	constructor() {
		super();
		this.link(themeCtx);
		let { $temp } = this.createTop();
		$temp`<div style:background=${() => isDark.value ? '#333' : '#fff'}></div>`;
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
$temp`${$async(this, async ({ $temp }, fallback) => {
	fallback(this.$chunk`<span>waiting</span>`);

	let data = await (await fetch('...')).text();
	$temp`<div>${data}</div>`;
})}`;
```

### async state
```typescript
let query = query(this.store, fetch('...').then(r => r.text()));

$temp`<div ${showIf(() => query.value.status === 'loading')}>waiting</div>`;
$temp`<div ${showIf(() => query.value.status === 'success')}>
	value: ${() => query.value.value}
</div>`;
```

### lazy loading
```typescript
// heavy.ts
class Heavy extends Component {}
registry.add('heavy', Heavy);

// main.ts
$temp`${new (registry.get('@lazy:heavy'))}`;
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