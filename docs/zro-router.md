# `zro-router` module
a lightweight multi page router that implements zero refresh optimization.

it intercepts the navigate events and updates the page without refreshing, it does this by
merging the head elements and replacing the body.

this mechanism reuse the already loaded scripts and optionaly styles and only loads the necessary
ones, also it preserve the state between pages and allow inter page transitions.

by that, it compines the benifits of single page websites and the multi page websites, providing
instantanous update, smaller initial load latency and reduced network traffic.

it only work for same origin urls.

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
`constructor`: construct the router with the given options.

### setup
```typescript
const router = new ZRORouter();
router.attachToDom();
```

### update options
- `transitions`: use view transitions api, allow animations between pages.
- `interceptClass`: anchor elements (`<a>`) with this class are only intercepted, if it is `''`,
all the anchor elements are intercepted.
- `preserveClass`: elements with this class are preserved during page update.
- `preserveTags`: head elements with these tags are fully preserved, will not be removed during update.
- `skipTags`: head elements with these tags are skiped during update, will not be removed nor added.

#### example
```typescript
// enable transitions between pages
const router = new ZRORouter({ transitions: true });

// keep context within the same section
// <a class="within-pages" href="./page2">page2</a> <!-- intercepted -->
// <a href="../another-section">another section</a> <!-- not intercepted -->
const router = new ZRORouter({ interceptClass: 'within-section' });

// keep styles
const router = new ZRORouter({ preserveTags: new Set(['script', 'style']) });

// keep some global styles
// <link rel="stylesheet" class="preserve" href="global.css">
const router = new ZRORouter({ preserveClass: 'preserve' });
```

### hash related options
- `scrollToHash`: when navigating, whether to scroll to the element whose id is the hash like what
browsers do, can be `false` to always scroll to top or `ScrollIntoViewOptions` to control the 
scrolling, deafult is smooth scrolling.
- `hashIsSeparateEntry`: when navigating to new url with the same path of the current page
and having different hash, whether to add it as new entry to history, default is `true`.   
like `./page` to `./page#hash`.
- `noHashScrollToTop`: when navigating to url with the same path of the current page and having
no hash, whether to scroll to top or keep in place, default is `true`.   
like from `./page#hash` to `./page`.

### handlers
- `fetcher`: a function that fetch the requested url, can return any `Error`, if `undefined`, 
use the default fetcher.
- `stateProvider`: a function that return any value that get passed to `history.pushState()`
as state, default give `undefined`.
- `errorPage`: a function that update the page to show the error encountered during update,
if not specified use the default error page.

#### example
```typescript
// add custom headers
const router = new ZRORouter({ fetcher: url => fetch(url, { headers: { 'custom-header': 'value' } }) });

// save state for each page
const router = new ZRORouter({ stateProvider: url => root.state });

// custom error page
const router = new ZRORouter({ errorPage: (router, url, error) => {
	registry.removeRoot();
	registry.setRoot(new ErrorComponent(document.getElementById('root'), url, error));
}})
```

## navigation
```typescript
export class ZRORouter {
	go (url: URL | string): void;
	back (): void;
	forward (): void;
	lastURL: URL;
	onRoute: Event<(router: ZRORouter, url: URL, set: (url: URL | false) => void) => void>;
}
```
`go`: navigate to a given url.

`back`: and `forward` navigate to the respectfull entry in the history.

`lastURL`: stores the last url navigated to, updated only after complete update.

`onRoute`: an event triggered when routing, pass a function called `set` that can be called to
change the url or to reject the request if called with `false`, `false` win then last one.

#### example
```typescript
// in page 1
router.go('/page2.html'); // navigate to page2
router.back(); // return to page1

router.onRoute.listen((router, url, set) => {
	// redirect page2 to page3
	if (url.pathname === '/page2.html') set('/page3.html');

	// block from page1 to page4
	if (url.pathname === '/page4.html' && router.lastURL.pathname === '/page1.html') set(false);	
});
```

## attaching to DOM
```typescript
export class ZRORouter {
	attachToDom (): void;
	onAttach: Event<(router: ZRORouter) => void>;
}
```
`attachToDom`: attach the router to DOM, override the default click behaviour of anchor elements. 

custom logic can be added by listening to `onAttach` event.

new anchors added after calling `attachToDom` will not be intercepted, another call is required.

#### example
```typescript
router.attachToDom();

someElement.append(newAnchor);

// required for normal function
router.attachToDom();
```	

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
`onBeforeFetch`: is an event triggered before fetching the new page, pass a function called 
`set` that can be called to change the url of the request.

`onAfterFetch`: is an event triggered after fetching the new page, passed with the response.

`onBeforeUpdate`: is event triggered before updating the page, passed with the fetched page 
document, can be used to modify the page before updating.

`onAfterUpdate`: is event triggered after updating the page, used to perform actions after update.

`onError`: is event triggered when encountering an error during update, do not use it to show 
error page.

#### example 
```typescript
router.onBeforeFetch.listen((router, url, set) => {
	// redirect page1 to page2
	if (url.pathname === '/page1.html') set('/page2.html');
});

router.onBeforeUpdate.listen((router, url, page) => {
	// in case some preparation is needed before update
	preparePageToUpdate(page);
});

router.onAfterUpdate.listen((router, url) => {
	// case using neocomp, root must be updated
	resigtry.removeRoot();
	registry.setRoot(new RootComponent(document.getElementById('root')));
})