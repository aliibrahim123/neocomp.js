# template reference
the templates in neocomp are nromal html, they can be parsed with any html parser.

however, they have more flexible and strictlier syntax than normal html.

#### features
- support unristricted case sensitive and tags and attrubutes names `@NS.name="value"`.
- support self close tags `<div/>`
- disallow unended tags `<div><span>hallo</div>`.

each element can have multiple templated attributes and action attributes.

# templated attributes
```html
<div .name='source'>
<div .name(props)='source'>
```
templated attributes are computed attributes, they are attributes that gets reevaluated at initial render or at each update.

they support any attribute and have featurefull syntax.

### `name`
the name section of a templated attribute, it is the attribute / property that is computed.

it can be:
- `...`: a regular attribute of name `...`.
- `text`: the text content of the element.   
in this case the source is defined in the element content, and the element can have only text as 
children.
- `html`: the html content of the element.
- `content`: the node children of the element.    
it can be single child or array of children, and child can string for text nodes or DOM `Node`.
- `prop:...`: a property on the element named `...`.
- `style:...`: a css property named `...`.
- `class:...`: a class named `...`, it is toggled based on the truthness of the evaluated value.
- `bool`: a boolean attribute named `...`, it is toggled based on the truthness of the evaluated 
value.
- `arg:...`: an argument named `...` passed to the child component attached to the element.

#### example
```html
<img src='${url}'>
<div .text>hallo @{to}</div>
<div .html='<span>hallo</span>'>
<div .content='{[hallo, create("span", {}, "world")]}'>
<div .prop:scrollTop='@{scroll}'>
<div .style:color='@{color}'>
<div .class:active='@{active}'>
<input type='checkbox' .bool:checked='@{checked}'>
<div @comp:this=example .arg:arg1='{1}'>
```

#### `props`
`props` are optional part added after name, it is a list of property names that this
attribute depends on separated by comma.

each property can start by `$` to indicate that the dependency is static (doesnt update
on change), else it is dynamic (update on change).

props can be `...` for auto tracked dependencies.

#### example
```html
<div .text($a,b)>a + b = @(){a + b}</div> <!-- updates only when b changes -->
<div .text(...)>a + b = @(){comp.get('a') + comp.get('b')}</div>
```

## `source`
`source` defines the syntax the the evaluated value.

it can be mono expression or template string.

### mono expression
source can be a mono expression defined by `{exp}` that pass its value directly without 
converting to string.

if using curly brackets (`{` or `}`), it doesnt need to be wrapped with double curly brackets 
(`{{exp}}`).

#### example
```html
<div .id="{'id'}">
<div .id="{if (comp.store.has('id')) return comp.get('id'); return 'id'}">
```

### template string
else source is a template string of syntax:
- `\...`: esacpe sequence, like javascript ones.
- `#{exp}`: constant expression, evaluated on define time.
- `${prop}`: static property accessor, returns the `prop` property value, static dependency.
- `@{prop}`: dynamic property accessor, returns the `prop` property value, dynamic dependency.
- `$(props){exp}`: static expression, `props` are the property dependencies separated by comma.
- `@(props){exp}`: dynamic expression, `props` are the property dependencies separated by comma, 
a property can starts with `$` to be static dependency.
- else it is literial part that get passed directly.

any value evaluated from an expression or property accessor is converted to string.

#### example
```html
<div .text>1 + 2 = #{1 + 2}</div> 
<div .text data-to="world">hallo \n $(){el.dataset.to}</div>
<div .text>@{a} + ${b} = @(a,$b){a + b}</div>
```

### expressions
expressions are normal javascript code wrapped with `{exp}` that evaluate into a value.  

they can consist of mutiple statements if they contains `;`, else they consist of single 
expression (doesnt need `return`).

if an expression needs to use curly brackets (`{` or `}`), it must be wrapped with `{{exp}}` and 
cant have any 2 curly brackets directly after each other (`{{` or `}}`).

a expression can be:
- **constant**: evaluated on definition time.
- **static**: evaluated on template convertion to DOM, have only static dependencies.
- **dynamic**: evaluated every time one of its dynamic dependencies change.

both dynamic and static expressions are evaluated with 
`(comp: PureComp, el: HTMLElement, context: Record<string, any>, ...props: any[])` the host 
component, element, the passed context and any properties they depend on.    
constant expressions are evaluated with no passed values.

#### example
```html
<div .text>1 + 2 = #{1 + 2}</div> 
<div .text>a + b = @(a,b){const result = comp.add(a, b); return result}</div>
<div .text data-to="world">hallo $(){{
	if (el.dataset.to) { return el.dataset.to } 
	return 'undefined';
}}</div>
```

# action attributes
```html
<div @action='definition'>
```
are attributes that define actions targeting the element.

## `@comp:this`
```html
<div @comp:this='name'>
```
creates a component of class `name` defined in registry and attach it to the element.

`name` is a `TName`.

#### example
```html
<div @comp:this='example'>
<div @comp:this='$:comp.get("comp") || "bare"'> <!-- name = 'comp' property else 'bare' -->
```

## `@do`
```html
<div @do='exp'>
```
execute the expression defined in `exp`, evaluated with 
`comp: PureComp, el: HTMLElement, context: Record<string, any>` the host component, element and 
the passed context.

#### example
```html
<div @do='el.focus()'> <!-- focus the element on initial render -->
```

## `@effect`
```html
<div @effect(props)='exp'>
<div @effect(...)='exp'>
```
add an effect of properties `props` (list separated by comma) and handler defined in `exp`.

evaluated with `comp: PureComp, el: HTMLElement, context: Record<string, any>, ...props: any[]` 
the host component, element, the passed context and the effecting properties.

props can be `...` for auto tracking dependencies.

#### example
```html
<div @effect(active)='if (active) el.animate(someAnimation)'>
<div @effect(...)='if (comp.active.value) el.animate(someAnimation)'>
```

## `@ref`
```html
<div @ref='name'>
```
adds / sets the element as reference of `name`, name is a `TName`.

if name is of syntax `el[]` then the reference type is `HTMLElement[]`, else it is 
`HTMLElement`.

#### example
```html
<div @ref='sections[]'>
<div @ref='$:Math.random() > 0.5 ? "ref1" : "ref2"'>
```

## `@on`
```html
<div @on(events)='exp'>
```
add an event listener for `events` (list separated by comma) of code defined in `exp`.

evaluated with `comp: PureComp, el: HTMLElement, context: Record<string, any>, event: Event` 
the host component, element, the passed context and the captured event.

#### example
```html
<input @on(input)='comp.set("value", el.value)'>
```

## `@chunk`
```html
<div @chunk:name='context'>
```
construct a chunk defined as `name` and insert its contents to the element.   

optional take an expression named `context` that evaluated into the context passed to the chunk.  
evaluated with `comp: PureComp`, `el: HTMLElement, context: Record<string, any>` the host 
component, element, and the passed context.

by default, it transfer the attributes of the chunk root to the element, can be disabled by 
`context.effectHost = false`.

#### example
```typescript
class Example extends Component<TypeMap> {
	static chunks = {
		example: $template('<div .text>hello $(){context.to}</div>')
	}
}
```
```html
<div @chunk:example='{to: "world"}'> <!-- => <div>hello world</div> -->
```

## inout action attributes
```html
<div @in(parentProp)='childProp'>
<div @out(parentProp)='childProp'>
<div @inout(parentProp)='childProp'>
```
bind properties between parent and child components.

- `in`: one way binding from parent to child.
- `out`: one way binding from child to parent.
- `inout`: two way binding between parent and child.

`parentProp` and `childProp` are the binded properties of parent and child respectfully.

#### example
```html
<div .text>value: @{value}</div>
<div @comp:this=example @in(value)='input'>
	<input @on(input)='comp.set("input", el.value)'>
</div>
```

## `@if`
```html
<div @if(props)='exp'>
<div @if(...)='exp'>
```
toggle element visibility based on the truthness of the evaluated expression `exp` that is 
reevaluated on `props` properties change.

the expression is evaluated with 
`comp: PureComp, el: HTMLElement, context: Record<string, any>, ...props: any[]` the host 
component, element, the passed context and the effecting properties.

props can be `...` for auto tracking dependencies, expression can consist of mutiple statements  
contains `;` but it must returns explicitly.

#### example
```html
<div @if(active)='active'>
<div @if(...)='const cond = comp.active.value; return cond'>
```

## common syntax
### `TName`
templated name is an argument that can be:
- `literial`: any string literal.
- `$prop`: the value of a static property.
- `$:exp`: the result of an expression, evaluated with 
`comp: PureComp`, `el: HTMLElement, context: Record<string, any>` the host component, element, and 
the passed context.

#### example
```html
<div @ref='ref'>
<div @comp:this='$classname'>
<div @ref='$:Math.random() > 0.5 ? "ref1" : "ref2'>
```