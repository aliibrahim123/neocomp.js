//the framework core

export * from './core/globalEvents.ts';
export { registry } from './core/registry.ts';
export type { CompProvider } from './core/registry.ts';
export * from './core/comp.ts';
export type * from './core/comp.ts';
export type * from './core/typemap.ts';
export * from './core/error.ts';
export * from './core/linkable.ts';
export type * from './core/linkable.ts';
export * from './core/context.ts';
export * from './core/lazy.ts';

export * from './state/signal.ts';
export * from './state/store.ts';
export type * from './state/store.ts';
export type * from './state/updateDispatcher.ts';
export * from './state/updateDispatcher.ts';
export * from './state/proxy.ts';
export * from './state/inout.ts';

export * from './action/actions.ts';
export type * from './action/actions.ts';

export * from './view/view.ts';
export type * from './view/view.ts';
export type { Template } from './view/templates.ts';
export { templates } from './view/templates.ts';
import * as tempGenMod from './view/generation.ts';
export const tempGen = { ...tempGenMod };
export type * as TempGen from './view/generation.ts';
export * from './view/walker.ts';
export type * from './view/walker.ts';
export * from './view/tempAttr.ts';
export type * from './view/tempAttr.ts';
import * as walkFnsMode from './view/walkInterface.ts';
export const walkFns = { ...walkFnsMode };
export type { Node as WalkNode, Fn as WalkFn } from './view/walkInterface.ts';
export { addActionAttr } from './view/actAttrs/index.ts';