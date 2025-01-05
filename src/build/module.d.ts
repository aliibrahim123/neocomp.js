declare module '*.neo.html' {
	import type { FileContent } from "../comp-base/view/generation.ts";
	const contants: Record<string, FileContent>;
	export default contants;
}