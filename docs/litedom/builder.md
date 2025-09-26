# builder
```typescript
export function builder (
	el?: HTMLElement | string,
	refiner?: (lite: LiteNode, native: HTMLElement) => void,
	converters?: Record<string, (lite: LiteNode) => Node>
): {
	add: (chunk: ParsedChunk) => void,
	end: () => HTMLElement
}
```
build a dom struture from a series of `ParsedChunk`s.

accept an optional root element, or its tag name, an optional refiner function called on each element, and an optional converters that converts litenodes of specific tag into a dom nodes.

`refiner` may be called multiple times on the same element if encountered in deffirent chunks.

returns an object containing:
- `add`: add the given chunk into the structure.
- `end`: stop the building and return the root element.

#### example
```typescript
let { add, end } = builder('div', (lite, el) => {
	el.setAttribute('data-id', lite.meta.get('id') || 'unknown');
});

add(parseChunk(['<span>hello</span>']));
add(parseChunk(['<span> world</span>']));

end() // => <div><span data-id=unknown>hello</span><span data-id=unknown> world</span></div>
```