import { Event } from "../../common/event.ts";
import type { ConstructorFor } from "../../common/types.ts";
import type { LiteNode } from "../../litedom/node.ts";
import type { Template } from "../view/templates.ts";
import type { PureComp } from "./comp.ts";

export const onAdd = new Event<(name: string, comp: ConstructorFor<PureComp>) => void>();
export const onNew = new Event<(comp: PureComp) => void>();
export const onRemove = new Event<(comp: PureComp) => void>();
export const onRootAdd = new Event<(comp: PureComp) => void>();
export const onRootRemove = new Event<(comp: PureComp) => void>();

export const onConvertTemplate = new Event<(comp: PureComp, template: Template, el: HTMLElement) => void>();
export const onAddTemplate = new Event<(template: Template) => void>();