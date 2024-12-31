import type { ZRORouter } from "./index.ts";
import { construct } from "../rawdom/index.ts";

export function defaultErrorPage (router: ZRORouter, url: URL, error: Error | Response) {
	document.body.replaceChildren(...construct(
`<div id=error-page style='color: red'>
	<h1>error: ${error instanceof Response ? `${error.status} ${error.statusText}` : error.name} </h1>
	<div>url: ${url}</div>
	<div>${error instanceof Error ? error.message : ''}</div>
</div>`))
}