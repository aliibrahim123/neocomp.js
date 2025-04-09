# `Component` class
neocomp is a component oriented framework, this means that it is build on the idea of components.

a component is an object that wraps a `HTMLElement` and define logic and state associated to it.

a component is composed of multiple functions that alter the states, this is opposed to most
frameworks that have only 1 function per component.

## `TypeMap`
```typescript
interface TypeMap extends BaseMap {}

export interface BaseMap {
	props: Record<string, any>,
	refs: Record<string, HTMLElement | HTMLElement[]>,
	childmap: Record<string, AnyComp>,
	args: Record<keyof any, any>,
	chunks: string
}

export type getTypeMap <Comp extends AnyComp> = BaseMap;
export type getProps <Comp extends AnyComp> = BaseMap['props'];
export type getRefs <Comp extends AnyComp> = BaseMap['refs'];
export type getChildMap <Comp extends AnyComp> = BaseMap['childmap'];
export type getArgs <Comp extends AnyComp> = BaseMap['args'];
export type getChunks <Comp extends AnyComp> = BaseMap['chunks'];
```
`TypeMap`: is an abstracted type that groups the types passed to `Component`.

it must extends from `BaseMap`, the base of all `TypeMap`, and it can contains any other types.

`TypeMap` should contain
- `props`: a `Record` of properties and their types.
- `refs`: a `Record` of references and their types.
- `childmap`: a `Record` of child names and their types.
- `args`: a `Record` of arguments and their types.

`getTypeMap`: extract the `TypeMap` of a given `Component`.

`getProps`, `getRefs`, `getChildMap`, `getArgs` and `getChunks`: extracts the respectfull type from
a given `Component`.

## constructor and options
```typescript
export class Component <TypeMap extends BaseMap> implements Linkable {
	constructor (el?: HTMLElement, args?: Partial<TypeMap[]>);
	options: CompOptions;
	static defaults: CompOptions;

	id: string;
	name: string;
}

export type CompOptions = {
	initMode: 'minimal' | 'standared' | 'fullControl' = 'standared';
	defaultId: (comp: PureComp) => string = () => '';
	anonymous: boolean = false;
	removeChildren: boolean = true;
	store: Partial<StoreOptions>;
	view: Partial<ViewOptions>;
}
```
`constructor`: take an optional `HTMLElement` and arguments and return a `Component`.

`options`: is the `CompOptions` defined for this component.

`defaults`: is the default `CompOptions` defined for all instances of the `Component`.

`id`: is the id of the component.    
if constructed with element that has an id, `id` is the element id, else it is the result 
of `options.defaultId`. 

`name`: is the name of the component passed to it through the `neo:name` attribute.

### `CompOptions`
- `initMode`: controls how the component is inited, more info in [initiation](#optionsinitmode)
- `defaultId`: a function that returns a custom id if neccessary.
- `anonymous`: if `true`, the component doesnt notify the global systems, like id map and
onNew global event.
- `removeChildren`: if `true`, remove its children with its removal.
- `store`: options passed to the store.
- `view`: options passed to the view.

## lifecycle and status
### status
```typescript
export class Component {
	status: Status;
}

export type Status = 'preInit' | 'coreInit' | 'domInit' | 'inited' | 'removing' | 'removed';
```
`status` can be of different values:
- `'preInit'`: no initiation has been done to the component.
- `'coreInit'`: store and view has been inited.
- `'domInit'`: component has been attached to DOM, the full structure and bindings of DOM has
been established.
- `inited`: component has been inited completly.
- `removing`: component is in removing phase.
- `removed`: component has been fully removed.

### initiation
```typescript
export class Component {
	init (): void;
	args (defaults: TypeMap['args']): TypeMap['args'];

	initCore (): void;
	initDom (): void;
	fireInit (): void;

	onDomInit: OTIEvent<(comp: this) => void>;
	onInitInternal: OTIEvent<(comp: this) => void>;
	onInit: OTIEvent<(comp: this) => void>;
}
```
#### `init` method
`init`: is a method that should be overided, it is called once on construction.

it is responsible for directing the initiation operation.

`args`: return the arguments passed to the component. it can be called once.

arguments passed through [`:arg:*`](../comp-base.view/template.md#templated-attribute) 
attributes wins then arguments passed through `constructor` then defaults passed through `args` method.

#### `options.initMode`
`options.initMode` effect how and what `init` method is responsible to call from the init 
methods.

if `options.initMode` is:
- `'minimal'`: the component will init automatically.   
`init` will be called after `initDom` and before `fireInit` and it is not responsible for any calling.    
this is best for testing or learning or for components with no custom init logic.
- `'standared'`: `init` is called after `initCore` and must call `initDom`.   
this is the default, it is best when custom init logic is required.
- `'fullControl'`: `init` is responsible for all init calls.    
use this when it is really required to fully control the init logic.

#### init methods
`initCore`: init the store and the view.

any code before it has no access to the states and the top element.

`initDom`: attach the component to the DOM, construct the template and establish the bindings.
 
call it after setting the default states to avoid overupdates.    
the code that requires references to elements in the DOM must be put after it.

`fireInit`: must be called after the component is fully inited and ready for outside 
interaction.    
it notifies the outside world to interact with the component.

the post init code can be placed after it.

#### init events
`onDomInit`: an event triggered when the component is attached to DOM and before post dom init 
code in `init` method.

`onInitInternal`: an event triggered when the component is fully inited, for internal use before
external notifying.

`onInit`: an event triggered when the component is fully init, for external use. 

by convention, all the interaction with the component must be called after this event.
because, the initial component may be a placeholder for the true component, like in lazy loading.    
for this, use the component passed by the event not the listened one.

### removing
```typescript
export class Component {
	onRemove: Event<(comp: this) => void>;
	remove (): void;
}
```
`remove`: removes the component and unlink it from everything.   
**note**: can be called multiple times safely while being in removing phase.

`onRemove`: an event triggered on removing.

## hierarchy
```typescript
export class Component {
	parent?: PureComp;
	children: PureComp[];
	childmap: TypeMap['childmap'];
}
```
components has a parent children hierarchy.

`childmap`: a `Record` that maps children by their names.

### linking
```typescript
export class Component {
	addChild (child: AnyComp, ind?: number): void;
	linkParent (parent: AnyComp): void;
	onChildAdded: Event<(comp: this, child: PureComp) => void>;
	onAddedToParent: Event<(comp: this, parent: PureComp) => void>;
}
```
`addChild`: add a child to a component at a given index, by default at the end.   
**note:** doesnt append the child top element, call the `linkParent` on child.

`linkParent`: link the passed component as parent to the component.

`onChildAdded`: an event triggered when a child is added.

`onAddedToParent`: an event triggered when a parent is linked.

### unlinking
```typescript
export class Component {
	unlinkParent (): void;
	unlinkChild (child: AnyComp) :void;

	onUnlinkedFromParent: Event<(comp: this, parent: PureComp) => void>;
	onChildUnlink: Event<(comp: this, child: PureComp) => void>;
}
```
`unlinkParent`: unlink the parent of the component.   
**note:** call `unlinkChild` on parent.

`unlinkChild`: unlink the given child from component.

`onUnlinkedFromParent`: an event triggered when the parent is unlinked.

`onChildUnlink`: an event triggered when a child is unlinked.

## store
```typescript
export class Component {
	store: Store<TypeMap['props']>;
	get <P extends keyof TypeMap['props']> (name: P | symbol): TypeMap['props'][P]
	set <P extends keyof TypeMap['props']> (name: P | symbol, value: TypeMap['props'][P]): void;
	signal <P extends keyof TypeMap['props']> (name: P | symbol, Default?: TypeMap['props'][P]):
	  Signal<TypeMap['props'][P]>;
	effect (
		effectedBy: (keyof TypeMap['props'] | symbol)[], handler: () => void,
		effect?: (keyof TypeMap['props'] | symbol)[]
	): void;
}
```
every `Component` has a `Store` that contains the state.

`get` and `set`: get and set a given property.

`signal`: creates a `Signal` of a given property.

`effect`: add an effect effected by and effecting a given properties.

**note**: all the given methods are type safe.

**more info**: read state [accessing](../comp-base.state/accessing.md) and 
[binding](../comp-base.state/binding.md).

## view
```typescript
export class Component {
	view: View<TypeMap['refs'], TypeMap['chunks']>;
	el: HTMLElement;
	refs: Record<keyof TypeMap['refs'], HTMLElement[]>;
	query <T extends HTMLElement = HTMLElement> (selector: string): T[];
}

export const attachedComp: symbol;
```
every `Component` has a `View` responsible for managing the DOM.

`el`: represents the top element that the component wraps.

can be the element passed to the component on creation, else an element created by 
`view.options.defaultEl`

`refs`: the references to elements created by [`@ref`](../comp-base.view/template.md#ref)
action attribute.

`query`: return all elements in the top element that match the given selector.

`attachedComp`: a symbol added to top element where its value refers to the attached component.

## linking
```typescript
export class Component {
	onLink: Event<(comp: this, linked: Linkable) => void>;
	onUnlink: Event<(comp: this, unlinked: Linkable) => void>;
	link (other: Linkable): void;
	unlink (other: Linkable): void;
	linkTo (other: Linkable): void;
	unlinkTo (other: Linkable): void;
	hasLink (other: Linkable): boolean;
}
```
`Component` implements the `Linkable` interface, read 
[linkable section](./linkable-and-context.md#linkable) for more info.

`linkTo`: links the component to a `Linkable`.

`unlinkTo`: unlinks the component from a `Linkable`.

## component variants
```typescript
export type PureComp = Component<BaseMap>;
export type AnyComp = Component<BaseMap> & /* ... */;
```
`PureComp`: is pureset `Component`, it is used to interact with any component.

`AnyComp`: is any `Component`, it accept any `Component`. it is custom typed to do this.

use `AnyComp` for arguments that take any `Component` and convert it to `PureComp` when working
with it, dont try to use `PureComp` for arguments else you will recieve type errors.

## boilerplate code for a component
```typescript
import { Component, registry } from "@neocomp/full/comp-base/core.ts";
import type { BaseMap, CompOptions } from "@neocomp/full/comp-base/core.ts";

interface TypeMap extends BaseMap {

}
 
class Example extends Component<TypeMap> {
	static override defaults: CompOptions = {
		...Component.defaults,
		view: { 
			template: /* ... */
		}
	};
	override async init() {
		const args = this.args({});
		this.initDom();
		this.fireInit();
	}
}

registry.add('example', Example);
```