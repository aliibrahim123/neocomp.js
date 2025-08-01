//"Zero Refresh Optimisation" router
//simple router for multiple page websites
//update pages without a single refresh
//by merging heads and replacing bodies

import { Event } from '../common/event.ts';
import { attach } from './attach.ts';
import { defaultErrorPage } from './errorPage.ts';
import { handleRoute } from './handleRoute.ts';

export interface Options {
	transitions: boolean,
	interceptClass: string,
	preserveClass: string,
	scrollToHash: false | ScrollIntoViewOptions,
	hashIsSeparateEntry: boolean,
	noHashScrollToTop: boolean,
	preserveTags: Set<string>,
	skipTags: Set<string>,
	fetcher: undefined | ((url: URL) => Promise<Response | Error>); 
	stateProvider: (url: URL) => any,
	errorPage: (router: ZRORouter, url: URL, error: Error | Response) => void
}

export class ZRORouter {
	#options: Options = {} as Options;

	onAttach = new Event<(router: this) => void>();
	onRoute = new Event<(router: this, url: URL, set: (url: URL | false) => void) => void>();
	onBeforeFetch = new Event<(router: this, url: URL, set: (url: URL) => void) => void>();
	onAfterFetch = new Event<(router: this, url: URL, respone: Response) => void>();
	onBeforeUpdate = new Event<(router: this, url: URL, page: Document) => void>();
	onAfterUpdate = new Event<(router: this, url: URL) => void>();
	onError = new Event<(router: this, url: URL, error: Error | Response) => void>();

	lastURL= new URL(location.href);

	constructor (options?: Partial<Options>) {
		this.#options = {
			transitions: false,
			interceptClass: '',
			preserveClass: 'preserve-on-route',
			scrollToHash: { behavior: 'smooth' },
			hashIsSeparateEntry: true,
			noHashScrollToTop: true,
			preserveTags: new Set(['script']),
			skipTags: new Set(),
			fetcher: undefined,
			stateProvider: () => undefined,
			errorPage: defaultErrorPage,
			...options
		};

		//upcase tags related options
		const preserveTags = new Set<string>();
		for (const tag of this.#options.preserveTags) preserveTags.add(tag.toUpperCase());
		this.#options.preserveTags = preserveTags;
		const skipTags = new Set<string>();
		for (const tag of this.#options.skipTags) skipTags.add(tag.toUpperCase());
		this.#options.skipTags = skipTags;
		
		//attach to window
		window.addEventListener('popstate', () => this.go(new URL(location.href)));
	}

	go (url: URL | string) {
		//normalize url
		var fullURL = new URL(url, location.href);
		if (fullURL.href === this.lastURL.href)

		//handle intercepting route
		var interceptResult: URL | false | undefined;
		this.onRoute.trigger(this, fullURL, 
		  (result) => interceptResult = interceptResult === false ? false : result
		);
		if (interceptResult === false) return;
		if (interceptResult instanceof URL) fullURL = interceptResult;

		handleRoute(this, this.#options, fullURL);
		this.lastURL = fullURL;
	}

	back () {
		history.back()
	}
	forward () {
		history.forward()
	}

	attachToDom () {
		attach(this, this.#options.interceptClass);
		this.onAttach.trigger(this);
	}
}