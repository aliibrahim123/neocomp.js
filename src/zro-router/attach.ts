import type { ZRORouter } from "./index.ts";
import { query } from '../dom-base/index.ts';

const hasVisited = Symbol('zro:has-visited');

export function attach (router: ZRORouter, interceptClass: string) {
	const anchors = query('a' + (interceptClass === '' ? '' : `.${interceptClass}`));
	for (const anchor of anchors as HTMLAnchorElement[]) {
		//if visited skip
		if (anchor[hasVisited]) continue;
		//if not same origin skip
		if (!anchor.href.startsWith(location.origin)) continue;
		//intercept click
		anchor.addEventListener('click', evt => {
			evt.preventDefault();
			router.go(anchor.href);
		})
		anchor[hasVisited] = true;
	}
}