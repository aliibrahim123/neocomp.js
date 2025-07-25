//the framework core

export * from './core/globalEvents.ts';
export { registry } from './core/registry.ts';
export * from './core/comp.ts';
export type * from './core/comp.ts';
export type * from './core/typemap.ts';
export { CompError, errorsLevels } from './core/error.ts';
export * from './core/linkable.ts';
export type * from './core/linkable.ts';
export * from './core/context.ts';
export * from './core/lazy.ts';
export { infoDump } from './core/infoDump.ts';

export * from './state/signal.ts';
export * from './state/store.ts';
export type { Prop, StoreOptions } from './state/store.ts';
export type * from './state/updateDispatcher.ts';
export * from './state/updateDispatcher.ts';
export * from './state/inout.ts';
export * from './state/query.ts';
export type * from './state/query.ts';

export { addAction, doActions, doActionsOfTemplate } from './action/actions.ts';
export type * from './action/actions.ts';

export * from './view/view.ts';
export type * from './view/view.ts';
export type { Template } from './view/templates.ts';
export { templates } from './view/templates.ts';
export { toDom as templateToDom } from './view/toDom.ts';
export { evalTAttr } from './view/tempAttr.ts';
export type { TAttr, TAttrExp, TAttrPart, TAttrProp } from './view/tempAttr.ts';

export { Event, OTIEvent, listenUntil } from '../common/event.ts';