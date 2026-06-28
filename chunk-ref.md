# chunk reference
chunks are html structure defined inside a {@linkcode ChunkBuild} by the {@linkcode ChunkBuild.html} tagged literials.

they support the same syntax as html, however they are not 100% spec compliant and any element can be self closed.

bindings are done by placeholders `${}` and can target attribute values and contents.

**computed expressions**: `() => T` functions that get reevaluated every time a property they read changes and their evaluated value is applied to the target.

# attribute placeholders
attribute placeholders are placed as attribute values after `=` and posibly quoted.

they set / bind a value as the target attribute value.

that value can be:
- `bool`: toggle the attribute based on it.
- `null` | `undefined`: remove the attribute.
- other value: stringified and set as the value.
- `Signal<T>` | `ReadSignal<T>`: each time the property changed, its value is applied to the attribute.
- **computed expressions**: the evaluated value is applied to the attribute.

the attribute placeholder can target element properties other than normal attributes, the attribute name can be:
- `class:name`: toggle class `name` based on the placeholder value.
- `style:prop`: set css property `prop` based on the placeholder value. 
- `prop:name`: set element object property `name` based on the placeholder value.
- `on:event`: add a listener to the event `event`. 

there special attributes placeholder (other than `on:event`) also accept signals and computed expressions for dynamic binding.

# content placeholders
content placeholders are placed as children of an element.

they insert a value as a content of the element, with posible dynamic binding.

their value can be:
- `undefiend` | `null`: insert empty text node.
- `Node`: insert it into the element.
- other values: stringified and inserted as text node.
- `Signal<T>` | `ReadSignal<T>`: each time the property changed, its value replaces the old content.
- **computed expressions**: the evaluated value replaces the old content.

# do blocks
do blocks are code blocks that evaluate when the `ChunkBuild` reach the point they are in the struture.

they are defined as `<${() => { ... }}>` where the passed function is called with `(ChunkBuild, Element)`;

their parent can be accesed by {@linkcode ChunkBuild.cur_el}, they can also define nested chunks targetting their point in the structure.