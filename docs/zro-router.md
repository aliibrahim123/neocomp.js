# ZRO Router
a lightweight router that implements zero refresh optimization.

in simple terms, it intercepts the navigate events and updates the page without refreshing, it
does this by merging the head and replacing the body.

this keeps the already loaded scripts and optionaly styles and only loads the necessary ones,
this enable instantanous page updates and mostly reduce the network traffic.

this gives the multi page websites the instantanous update latency of single page websites 
while keeping the smaller initial load latency.

# `ZRORouter` class
the class of the router.

## constructor and options
```typescript
export class ZRORouter {
	constructor (options?: Partial<Options>);
}

export interface Options {
	transitions: boolean = false,
	interceptClass: string = '',
	preserveClass: string = 'preserve-on-route',
	preserveTags: Set<string> = new Set(['script']),
	skipTags: Set<string> = new Set(),

	scrollToHash: false | ScrollIntoViewOptions = { behavior: 'smooth' },
	hashIsSeparateEntry: boolean = true,
	noHashScrollToTop: boolean = true,

	fetcher: undefined | ((url: URL) => Promise<Response | Error>) = undefined; 
	stateProvider: (url: URL) => any = () => {},
	errorPage: (router: ZRORouter, url: URL, error: Error | Response) => void = defaultErrorPage
}
```
construct the router.

### update options
- `transitions`: enable view transitions api.
- `interceptClass`: anchor elements (`<a>`) with this class are only intercepted, if it is `''`,
all the anchor elements are intercepted.
- `preserveClass`: elements with this class are preserved during page update.
- `preserveTags`: elements with these tags are fully preserved, will not be removed during update.
- `skipTags`: elements with these tags are skiped during update, will not be removed nor added.

### hash related options
- `scrollToHash`: scroll to hash like what browsers do, can be `false` to disable it or 
`ScrollIntoViewOptions` to control the scrolling.
- `hashIsSeparateEntry`: when navigating to new url with the same path of the current page
and having different hash, wether to add it as new entry to history.
- `noHashScrollToTop`: when navigating to url with the same path of the current page and having
no hash, wether to scroll to top or not.

### handlers
- `fetcher`: a function that fetch the requested url, can return any `Error`, if `undefined`, 
use the default fetcher.
- `stateProvider`: a function that return any value that get passed to `history.pushState()`
as state, default give `undefined`.
- `errorPage`: a function that update the page to show the error encountered during update,
if not specified use the default error page.

## routing
```typescript
export class ZRORouter {
	go (url: URL | string): void;
	back (): void;
	forward (): void;
	lastURL: URL;
	onRoute: Event<(router: ZRORouter, url: URL, set: (url: URL | false) => void) => void>;
}
```
`go` navigate to a given url.

`back` and `forward` navigate to the respectfull entry in the history.

`lastURL` stores the last url navigated to, updated only after complete update.

`onRoute` an event triggered when routing, pass a function called `set` that can be called to
change the url or to reject the request if called with `false`, `false` win then last one.

## attaching to DOM
```typescript
export class ZRORouter {
	attachToDom (): void;
	onAttach: Event<(router: ZRORouter) => void>;
}
```
`attachToDom` attach the router to DOM. 

by default it adds click handlers to anchor elements `<a>`, but user can add custom logic by
listening to `onAttach` event.

## update events
```typescript
export class ZRORouter {
	onBeforeFetch: Event<(router: ZRORouter, url: URL, set: (url: URL) => void) => void>;
	onAfterFetch: Event<(router: ZRORouter, url: URL, respone: Response) => void>;
	onBeforeUpdate: Event<(router: ZRORouter, url: URL, page: Document) => void>;
	onAfterUpdate: Event<(router: ZRORouter, url: URL) => void>;
	onError: Event<(router: ZRORouter, url: URL, error: Error | Response) => void>;
}
```
`onBeforeFetch` is an event triggered before fetching the new page, pass a function called `set`
that can be called to change the url of the request.

`onAfterFetch` is an event triggered after fetching the new page, passed with the response.

`onBeforeUpdate` is event triggered before updating the page, passed with the fetched page 
document.

`onAfterUpdate` is event triggered after updating the page.

`onError` is event triggered when encountering an error during update.