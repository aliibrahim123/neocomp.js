# rawdom
the rawdom modules provide general DOM utilities for simplier DOM manipulation.

# `rawdom` module
this modules exports various functions for working with DOM nodes.

### from()
```typescript
export function from (
  inp: string | HTMLElement | HTMLElement[] | ArrayLike<HTMLElement>, Throw: boolean = false
): HTMLElement[];
```
normalize input into `HTMLElement[]`, optionaly throws.    
- if input is string:
	- if it is html template (first char is `<`), construct it,
	- if it is html tag (first char matches `/[a-z]/`), create it,
	- else it is css selector, return all elements matching it.
- else normalize into array.
- if not normalizable, throw or return empty array based on `Throw`.

#### example
```typescript
from('div') // => [<div>] 
from('<div>hallo</div>') // => [<div>hallo</div>] 
from('div#id') // => [div#id] 
from(element) // => [element]
from([element]) // => [element]
from(new Set([element])) // => [element]
from(null, false) // => []
```

### query()
```typescript
export function query <T extends HTMLElement = HTMLElement> 
  (selector: string, root: Element | Document = document): T[];
```
return all the elements in root that matches the specified css selector.   
can take an optional type parameter `T` that is the returned type.

#### example
```typescript
query('div') // => [...div]
query('div.class') // => [...div.class]
```

### construct() and constructOne()
```typescript
export function construct (template: string, withText: boolean = false): (HTMLElement | Text)[];
export function constructOne (template: string): HTMLElement;
```
construct the given html template.

`constructOne` takes template of a single element.    
while `construct` takes template of multiple elements, optionally with text nodes in root.

#### example
```typescript
construct('<div>hallo</div> <div>world</div>') // => [<div>hallo</div>, <div>world</div>]
construct('<div>hallo</div> from <div>world</div>', true) // => [<div>hallo</div>, " from ", <div>world</div>]
constructOne('<div>hallo</div>') // => <div>hallo</div>
```

### create() and apply ()
```typescript
export function create (tag: string, ...params: CreateParam[]): HTMLElement;
export function apply (el: HTMLElement, param: CreateParam): void;

export type CreateParam = 
	string | Node | undefined | null | false | 
	((el: HTMLElement) => CreateParam) | CreateObject | CreateParam[];

type CreateObject = {
	classList?: string[],
	style?: Record<string, string>,
	attrs?: Record<string, string | number | boolean>,
	events?: Record<string, (this: HTMLElement, evn: Event) => void>,
	[prop: string]: any
}
```
`create` creates a `HTMLElement` from a given html tag and apply `CreateParam`s to it.
    
`apply` takes a `HTMLElement` and apply a given `CreateParam`.

`CreateParam` can be:
- `string` then if it is:
	- an id (starts with `#`), set it to the element.
	- a class (starts with `.`) add it to the element.
	- else it is a normal text, append it.
- `Node`, append it.
- a fulsy value, ignore it.
- `(el: HTMLElement) => CreateParam`, a function that take the element and return a `CreateParam`.
- `CreateParam[]`, apply each of them.
- `CreateObject` that consists of:
	- optional `classList` that contains classes to get added.
	- optional `style`, a `Record` of css property and thier values.
	- optional `attrs`, a `Record` of attribute and thier values.
	- optional `events`, a `Record` of event type and their listener.
	- else the property and its value will be set to the element directly.

**note**: this functions are highly type safe with typed attributes, events and properties.

#### example
```typescript
create('div', 'hallo', '#id', '.class') // => <div id=id class=class>hallo</div>
create('div', create('span', 'hallo'), false, () => 'world') // => <div><span>hallo</span>world</div>
create('div', { classList: ['class1', 'class2'], style: { color: 'red' } }) 
	// => <div class="class1 class2" style="color: red"></div>
create('div', { events: { click: () => console.log('clicked'), innerText: 'hallo' } })
	// => <div onclick="console.log('clicked')">hallo</div>

const el = create('div');
apply(el, 'hallo'); // => <div>hallo</div>
```

# `rawdom/elements` module
this modules exports functions named after html tags and create the corresponding `HTMLElement`
while taking the corresponding `CreateParam`.

### general signature
```typescript
export function tag (...params: CreateParam<'tag'>): HTMLTagElement
```

#### example
```typescript
div('hallo ', span('world'), '.class') // => <div class="class">hallo <span>world</span></div>
```