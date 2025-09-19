// the routing logic

import type { fn } from "../common/types.ts";
import { query } from "../rawdom/index.ts";
import type { ZRORouter } from "./index.ts";
import type { Options } from "./index.ts";

const defer = (fn: fn) => setTimeout(fn, 5);

export function handleRoute (router: ZRORouter, options: Options, url: URL) {
	// if not same page, update
	if (url.pathname !== router.lastURL.pathname) return startUpdate(router, options, url);

	// else scroll to hash or top
	else if (url.hash) { if (options.scrollToHash) defer(
		() => query(url.hash)[0]?.scrollIntoView?.(options.scrollToHash)
	) }
	else if (options.noHashScrollToTop) defer(() => scroll(0, 0));

	// push to history if required
	if (options.hashIsSeparateEntry && location.href !== url.href)
		history.pushState(options.stateProvider(url), '', url);
}

async function startUpdate (router: ZRORouter, options: Options, url: URL) {
	// handler interception
	var interceptedURL: URL = undefined as any;
	router.onBeforeFetch.trigger(router, url, (url) => interceptedURL = url);
	if (interceptedURL) url = interceptedURL;
	
	// fetch
	const response = options.fetcher ?
		await options.fetcher(url) : 
		await fetch(url).then(r => r, e => e as Error);

	// is error
	if (response instanceof Error || !response.ok) return onError(router, options, url, response);

	router.onAfterFetch.trigger(router, url, response);

	// generate page
	const page = (new DOMParser()).parseFromString(await response.text(), 'text/html');

	// push to history
	if (location.href !== url.href) history.pushState(options.stateProvider(url), '', url);

	// update page
	if (options.transitions && document.startViewTransition as any)
		document.startViewTransition(() => handleUpdate(router, options, url, page));
	else handleUpdate(router, options, url, page);
}

function handleUpdate (router: ZRORouter, options: Options, url: URL, page: Document) {
	router.onBeforeUpdate.trigger(router, url, page);

	updateHead(page, options);

	// move preserved body elements to new page
	const preserveClass = options.preserveClass;
	for (const elem of query(`.${preserveClass}`, document.body)) 
		query(`.${preserveClass}#${elem.id}`, page.body)[0]?.replaceWith?.(elem);

	// replace body
	document.body.replaceChildren(...page.body.childNodes);
	
	// scroll to hash
	if (url.hash) { if (options.scrollToHash) 
		defer(() => query(url.hash)[0]?.scrollIntoView?.(options.scrollToHash))
	}
	// else scroll to top
	else defer(() => scroll(0, 0))
	
	// attach to dom
	router.attachToDom();

	// trigger after update event
	router.onAfterUpdate.trigger(router, url);
}

function onError (router: ZRORouter, options: Options, url: URL, error: Response | Error) {
	options.errorPage(router, url, error);
	router.onError.trigger(router, url, error);
	history.pushState(options.stateProvider(url), '', url);
}

// when moving elements between 2 defferent documents, some functions like loading scripts dont work
// so clone them
function cloneElement (element: Element) {
	const cloned = document.createElement(element.tagName.toLowerCase());
	for (const attr of element.attributes) cloned.setAttribute(attr.name, attr.value);
	cloned.innerHTML = element.innerHTML;
	return cloned;
}

function updateHead (page: Document, options: Options) {
	const head = document.head;
	const { preserveTags, preserveClass, skipTags } = options;
	const elementsMap = new Map<string, { old: Element[], _new: Element[] }>();
	
	// group old elements
	for (const element of head.children) {
		if (!elementsMap.has(element.tagName)) 
			elementsMap.set(element.tagName, { old: [element], _new: [] });
		else elementsMap.get(element.tagName)?.old.push(element);
	}
	// group new element
	for (const element of page.head.children) {
		if (!elementsMap.has(element.tagName)) 
			elementsMap.set(element.tagName, { old: [], _new: [element] });
		else elementsMap.get(element.tagName)?._new.push(element);
	}

	// loop through tags
	for (const [tag, elements] of elementsMap) {
		if (skipTags.has(tag)) continue;
		// preserve tags: add if not been before
		if (preserveTags.has(tag)) { 
		  for (const newElement of elements._new)
			if (!elements.old.some(oldElement => oldElement.id === newElement.id)) 
				head.append(cloneElement(newElement));
		}
		else updateOtherHeadEls(elements, preserveClass);
	}
}

function updateOtherHeadEls (elements: { old: Element[], _new: Element[] }, preserveClass: string) {
	const head = document.head;
	// remove old elements if not preserved
	for (const oldElement of elements.old) 
		if (!oldElement.classList.contains(preserveClass)) oldElement.remove();

	// add new elements if not preserved or hasnt been before
	for (const newElement of elements._new) if (!(
		newElement.classList.contains(preserveClass) 
		 && elements.old.some(oldElement => oldElement.id === newElement.id)
	)) head.append(cloneElement(newElement))
}