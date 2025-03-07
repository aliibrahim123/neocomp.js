# template reference
the templates in neocomp are normal html syntax, they can be parsed with any html parser.

each element can have multiple templated attributes and action attributes.

## templated attributes
**syntax**: `:name='source'` or `:name(props)='source'`.

templated attributes (also known as `TAttr`) binds properties to a given attribute or set its 
value according to `source`.

#### `name`
`name` is the thing that the `TAttr` is defined for. it can be:
- `prop:...`: the `TAttr` works on the `...` property of the `HTMLElement`.
- `style:...`: the `TAttr` works on the `...` css property of the element.
- `text`: the `TAttr` works on text of the element, note that in this case the `source` is 
defined in the element content, and the element cant have any element children.
- `html`: the `TAttr` works on html content of the element.
- `class:...`: the `TAttr` toggles the `...` class of the element based on the truthness of the 
value evaluated from `source`.
- `arg:...`: the `TAttr` set the `...` argument passed to the component attached to the element.
- else, the `TAttr` works on the `name` attribute of the element.

#### `props`
`props` are optional part added after `name`, it is a list of property names that this
attribute depends on separated by comma (`,`).

each property can start by `$` to indicate that the dependency is static (doesnt update
on change), else it is dynamic (update on change).

### `source`
`source` defines the syntax the the evaluated value.

#### mono expression
`source` can be a mono expression defined by `{exp}` that pass its value directly without 
converting to string.

if `TAttr` have no dependencies on any properties, it is a constant expression.    
else it is static or constant depending if it has any dynamic dependencies.

**note:** if using curly brackets (`{` or `}`), it doesnt need to be wrapped with double curly brackets (`{{exp}}`).

#### template string
else `source` is a template string of syntax:
- `\...`: esacpe sequence, like javascript ones.
- `#{exp}`: constant expression, evaluated on define time.
- `${prop}`: static property accessor, returns the `prop` property value, static dependency.
- `@{prop}`: dynamic property accessor, returns the `prop` property value, dynamic dependency.
- `$(props){exp}`: static expression, `props` are the property dependencies separated by comma.
- `@(props){exp}`: dynamic expression, `props` are the property dependencies separated by comma, 
a property can starts with `$` to be static dependency.
- else it is literial part that get passed directly.

**note:** any value evaluated from an expression or property accessor is converted to string.

### expressions
expressions are normal javascript code wrapped with `{exp}`.  

they can consist of mutiple statements if they contains `;`, else they consist of single 
expression that get returned.

if an expression needs to use curly brackets (`{` or `}`), it must be wrapped with `{{exp}}` and 
cant have any 2 curly brackets directly after each other (`{{` or `}}`).

a expression can be:
- **constant**: evaluated on definition time.
- **static**: evaluated on template convertion to DOM, have only static dependencies.
- **dynamic**: evaluated every time one of its dynamic dependencies change.

**note:** both dynamic and static expressions are evaluated with `comp: PureComp` and `el: HTMLElement` plus the properties they depend on.    
constant expressions are evaluated with no passed values.

## action attributes
are attributes of syntax `@name=value` that define actions targeting the element.

### `@comp:this`
**syntax:** `@comp:this='name'`   
creates a component of class `name` defined in registry and attach it to the element.

all actions defined for the element are executed before this action.

### `@do`
**syntax:** `@do='exp'`  
execute the expression defined in `exp`, evaluated with `comp: PureComp` and `el: HTMLElement`.

### `@effect`
**syntax:** `@effect(props)='exp'`  
add and effect of properties `props` (list separated by comma) and handler defined in `exp`.

evaluated with `comp: PureComp` and `el: HTMLElement` plus the properties effecting the effect.

### `@ref`
**syntax:** `@ref='name'`
adds the element as reference of `name`

### `@on`
**syntax:** `@on(events)='exp'`   
add an event listener for `events` (list separated by comma) of code defined in `exp`.

evaluated with `comp: PureComp`, `el: HTMLElement` and `event: Event`.

### inout action attributes
**syntax:** `@name(parentProp)='childProp'`   
bind properties between parent and child components.

`name` can be:
- `in`: one way binding from parent to child.
- `out`: one way binding from child to parent.
- `inout`: two way binding between parent and child.

`parentProp` and `childProp` are the binded properties of parent and child respectfully.