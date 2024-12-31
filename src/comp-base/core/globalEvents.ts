import { Event } from "../../common/event.ts";
import type { ConstructorFor } from "../../common/types.ts";
import type { LiteNode } from "../../litedom/node.ts";
import type { Template } from "../view/templates.ts";
import type { AnyComp } from "./comp.ts";

export const onAdd = new Event<(name: string, comp: ConstructorFor<AnyComp>) => void>();
export const onNew = new Event<(comp: AnyComp) => void>();
export const onRemove = new Event<(comp: AnyComp) => void>();
export const onRootAdd = new Event<(comp: AnyComp) => void>();
export const onRootRemove = new Event<(comp: AnyComp) => void>();

export const onConvertTemplate = new Event<(comp: AnyComp, template: Template, el: HTMLElement) => void>();
export const onAddTemplate = new Event<(template: Template) => void>();