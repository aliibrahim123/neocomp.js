import { Event } from "../../common/event.ts";
import type { ConstructorFor } from "../../common/types.ts";
import { Component } from "./comp.ts";

/** event triggered when a component class is registered */
export const onAdd = new Event<(name: string, comp: ConstructorFor<Component>) => void>();
/** event triggered when a component is added */
export const onNew = new Event<(comp: Component) => void>();
/** event triggered when a component is removed */
export const onRemove = new Event<(comp: Component) => void>();
/** event triggered when a root is attached */
export const onRootAdd = new Event<(comp: Component) => void>();
/** event triggered when a root is removed */
export const onRootRemove = new Event<(comp: Component) => void>();