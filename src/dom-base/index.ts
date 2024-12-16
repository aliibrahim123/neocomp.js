import type { AttrsMap as AttrMap, EventMap, TypeMap } from './typebase.ts';

export function from (a: string | Element | Element[] | ArrayLike<Element>, Throw = false): Element[] {
	if (typeof(a) === 'string') {
		//construct if = '<el>text</el>'
		if (a[0] === '<') return construct(a);
		//create element if = 'tag'
		if (a[0].match(/[a-z]/)) return [document.createElement(a)];
		//else query
		return Array.from(document.querySelectorAll(a));
	}
	if (a instanceof Element) return [a];
	if (Array.isArray(a)) return a;
	//case arrayLike
	if (a?.length !== undefined) return Array.from(a);
	//invalid input
	if (Throw) throw new TypeError(`cannot convert ${a?.constructor?.name} to Element[]`)
	return [];
}

export function query (selector: string, root: Element | Document = document) {
	return Array.from(root.querySelectorAll(selector))
}

export type CreateParam<E extends keyof TypeMap> = 
	string | Node | ((el: HTMLElement) => CreateParam<E>) | CreateObject<E> | CreateParam<E>[];

type CreateObject<E extends keyof TypeMap> = {
	classList?: string[],
	style?: { [K in keyof CSSStyleDeclaration]?: string },
	attrs?: AttrMap[E] & { [attr: string]: string | number | boolean },
	events?: 
		{ [K in keyof EventMap[E]]?: (this: TypeMap[E], evn: EventMap[E][K]) => void;}
		& { [type: string]: (this: TypeMap[E], evn: Event) => void },
	[prop: string]: any
} & { [K in keyof TypeMap[E]]?: TypeMap[E][K] }

export function create <E extends keyof TypeMap> (tag: E, ...params: CreateParam<E>[]): TypeMap[E] {
	const el = document.createElement(tag);
	for (const param in params) apply(el, params[param]);
	return el
}

export function apply <E extends keyof TypeMap> (el: TypeMap[E], param: CreateParam<E>) {
	if (typeof(param) === 'string') {
		//id
		if      (param[0] === '#') el.id = param.slice(1);
		//class
		else if (param[0] === '.') el.classList.add(param.slice(1));
		//text node
		else el.append(param);
	}
	else if (param instanceof Node) el.append(param);
	else if (Array.isArray(param)) for (const item of param) apply(el, item);
	else if (typeof(param) === 'function') apply(el, param(el));
	else if (typeof(param) === 'object' && param !== null) for (const key in param) {
		if      (key === 'classList') el.classList.add(...param.classList as any);
		else if (key === 'style') 
			for (const prop in param.style) el.style.setProperty(prop, param.style[prop]);
		else if (key === 'attrs')
			for (const attr in param.attrs) el.setAttribute(attr, String(param.attrs[attr]));
		else if (key === 'events')
			for (const event in param.events) el.addEventListener(event, param.events[event]);
		else el[key] = param[key];
	}
}

export function construct (template: string): Element[];
export function construct (template: string, withText: true): ChildNode[];
export function construct (template: string, withText: boolean = false) {
	const temp = document.createElement('div');
	temp.innerHTML = template;
	const childs = Array.from(withText ? temp.childNodes : temp.children);
	temp.replaceChildren(); //release temp
	return Array.from(childs)
}

export function constructOne (template: string) {
	const temp = document.createElement('div');
	temp.innerHTML = template;
	const el = temp.children[0];
	temp.replaceChildren() //release temp;
	return el
}