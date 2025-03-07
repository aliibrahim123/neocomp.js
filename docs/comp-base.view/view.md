# `View`
`View`: is a unit that connects the `Component` with the DOM.

it is responsible for initial render and DOM managment. also it provides various utilities
for working with DOM.

## constructor and options
```typescript
export class View <Refs extends Record<string, HTMLElement>> {
	constructor (comp: AnyComp, el?: HTMLElement, options?: Partial<ViewOptions>);
	comp: PureComp;
	el: HTMLElement;
	options: ViewOptions;
	static defaults: ViewOptions;
}

export interface ViewOptions {
	defaultEl: (comp: PureComp) => HTMLElement;
	template: Template;
	insertMode: InsertMode = 'asDefault';
	into: string | undefined = undefined;
	walkInPreContent: boolean = false;
	removeEl: boolean = true;
}

export type InsertMode = 'asDefault' | 'replace' | 'atTop' | 'into' | 'atBottom' | 'none';
```
`constructor`: take a `Component` and optional `HTMLElement` and `ViewOptions`.

`el`: the top element, can be the passed element, else the result of `options.defaultEl`.

`options`: is the `ViewOptions` defined for this view.

`defaults`: is the default `ViewOptions` defined for all instances of the `View`.

### `ViewOptions`
- `defaultEl`: a function that returns a `HTMLElement` used as top element if no element was 
passed during construction, defualt `<div>`.
- `template`: the `Template` used in initial render, default `<div>`.
- `insertMode`: how the `Template` is inserted to DOM, defualt `asDefault`, it can be:
  - `asDefault`: insert the template when there was no top element passed.
  - `replace`: insert the template and replace the content before if any.
  - `atTop`: insert the template at the top of the top element.
  - `atBottom`: insert the template at the bottom of the top element.
  - `into`: insert the template into the element matching `options.into` in the top element.
  - `none`: doesnt insert the template.
- `into`: if `insertMode` is `into`, a selector to the element to insert the `Template` in.
- `walkInPreContent`: whether to walk in the passed top element contents, if any, to gather 
`Action`s, this enable the features of the template in that element, default `false`.
- `removeEl`: remove the top element when the component is removed, default `true`.

## utilities
```typescript
export class View {
	query (selector: string): HTMLElement[];

	refs: Record<keyof Refs, HTMLElement[]>;
	addRef <R extends keyof Refs> (name: R, el: Refs[R]): void;
}
```
`query`: return all elements in the top element that match the given selector.

`refs`: the references to elements created by [`@ref`](../comp-base.view/template.md#ref)
action attribute.

`addRef`: add the given element as a reference.

## walking and actions
```typescript
export class View {
	walk (top: HTMLElement, options: Partial<WalkOptions> = {}): void;
	onWalk: Event<(view: this, el: HTMLElement, options: Partial<WalkOptions>) => void>;

	doActions (actions: Action[], top: HTMLElement? = this.el, lite?: LiteNode): void;
	onAction: Event<(view: this, top: HTMLElement, action: Action[]) => void>;
}
```
`walk`: walk the given element to gather `Action`s, can be passed with `WalkOptions`.

`onWalk`: an event triggered when walking an element.

`doActions`: do the passed `Action`s, can be passed with an optional `top` element.

if the actions are from a `Template`, must pass the `LiteNode` representing the `top` element.

`onAction`: an event triggered when doing actions.

## cleanup
```typescript
export class View {
	onCleanUp: Event<(view: this) => void>;
	cleanup (): void;
}
```
`cleanup`: called when removing elements and want to remove the dependencies on them.

by default it removes all the effects that rely on elements removed from the DOM.   
to add this mechanism to your effects, add the element that the effect rely on in `meta.el` of 
the effect.

`onCleanUp`: an event triggered when requesting a cleanup.