import { Event } from "../../common/event.ts";
import type { ConstructorFor } from "../../common/types.ts";
import { Component } from "./comp.ts";

export const onAdd = new Event<(name: string, comp: ConstructorFor<Component>) => void>();
export const onNew = new Event<(comp: Component) => void>();
export const onRemove = new Event<(comp: Component) => void>();
export const onRootAdd = new Event<(comp: Component) => void>();
export const onRootRemove = new Event<(comp: Component) => void>();