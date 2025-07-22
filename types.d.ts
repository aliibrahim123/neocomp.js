declare module '@neocomp/full/rawdom' {
	export function from(a: string | HTMLElement | HTMLElement[] | ArrayLike<HTMLElement>, Throw?: boolean): HTMLElement[];
	export function query<T extends HTMLElement = HTMLElement>(selector: string, root?: Element | Document): T[];
	export type CreateParam<E extends keyof TypeMap> = string | Node | undefined | null | false | ((el: HTMLElement) => CreateParam<E>) | CreateObject<E> | CreateParam<E>[];
	type CreateObject<E extends keyof TypeMap> = {
		classList?: string[];
		style?: {
			[K in keyof CSSStyleDeclaration]?: string;
		};
		attrs?: AttrsMap[E] & {
			[attr: string]: string | number | boolean;
		};
		events?: {
			[K in keyof EventMap[E]]?: (this: TypeMap[E], evn: EventMap[E][K]) => void;
		} & {
			[type: string]: (this: TypeMap[E], evn: Event) => void;
		};
		[prop: string]: any;
	} & {
		[K in Exclude<keyof TypeMap[E], 'style'>]?: TypeMap[E][K];
	};
	export function create<E extends keyof TypeMap>(tag: E, ...params: CreateParam<E>[]): TypeMap[E];
	export function create(tag: string, ...params: CreateParam<keyof TypeMap>[]): HTMLElement;
	export function apply<E extends keyof TypeMap>(el: TypeMap[E], param: CreateParam<E>): void;
	export function apply(el: HTMLElement, param: CreateParam<keyof TypeMap>): void;
	export function construct(template: string): HTMLElement[];
	export function construct(template: string, withText: true): ChildNode[];
	export function constructOne(template: string): HTMLElement;
	interface AriaAttrs {
		'aria-activedescendant'?: string;
		'aria-atomic'?: boolean | 'false' | 'true';
		'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
		'aria-busy'?: boolean | 'false' | 'true';
		'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
		'aria-colcount'?: number;
		'aria-colindex'?: number;
		'aria-colspan'?: number;
		'aria-controls'?: string;
		'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
		'aria-describedby'?: string;
		'aria-details'?: string;
		'aria-disabled'?: boolean | 'false' | 'true';
		'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
		'aria-errormessage'?: string;
		'aria-expanded'?: boolean | 'false' | 'true';
		'aria-flowto'?: string;
		'aria-grabbed'?: boolean | 'false' | 'true';
		'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
		'aria-hidden'?: boolean | 'false' | 'true';
		'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		'aria-keyshortcuts'?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		'aria-level'?: number;
		'aria-live'?: 'off' | 'assertive' | 'polite';
		'aria-modal'?: boolean | 'false' | 'true';
		'aria-multiline'?: boolean | 'false' | 'true';
		'aria-multiselectable'?: boolean | 'false' | 'true';
		'aria-orientation'?: 'horizontal' | 'vertical';
		'aria-owns'?: string;
		'aria-placeholder'?: string;
		'aria-posinset'?: number;
		'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
		'aria-readonly'?: boolean | 'false' | 'true';
		'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals';
		'aria-required'?: boolean | 'false' | 'true';
		'aria-roledescription'?: string;
		'aria-rowcount'?: number;
		'aria-rowindex'?: number;
		'aria-rowspan'?: number;
		'aria-selected'?: boolean | 'false' | 'true';
		'aria-setsize'?: number;
		'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
		'aria-valuemax'?: number;
		'aria-valuemin'?: number;
		'aria-valuenow'?: number;
		'aria-valuetext'?: string;
	}
	interface DOMAttrs {
		onabort?: string;
		onanimationend?: string;
		onanimationiteration?: string;
		onanimationstart?: string;
		onblur?: string;
		oncanplay?: string;
		oncanplaythrough?: string;
		onchange?: string;
		onclick?: string;
		oncompositionend?: string;
		oncompositionstart?: string;
		oncompositionupdate?: string;
		oncontextmenu?: string;
		oncopy?: string;
		oncut?: string;
		ondblclick?: string;
		ondrag?: string;
		ondragend?: string;
		ondragenter?: string;
		ondragexit?: string;
		ondragleave?: string;
		ondragover?: string;
		ondragstart?: string;
		ondrop?: string;
		ondurationchange?: string;
		onemptied?: string;
		onencrypted?: string;
		onended?: string;
		onerror?: string;
		onfocus?: string;
		ongotpointercapture?: string;
		oninput?: string;
		onkeydown?: string;
		onkeypress?: string;
		onkeyup?: string;
		onload?: string;
		onloadeddata?: string;
		onloadedmetadata?: string;
		onloadstart?: string;
		onlostpointercapture?: string;
		onmousedown?: string;
		onmouseenter?: string;
		onmouseleave?: string;
		onmousemove?: string;
		onmouseout?: string;
		onmouseover?: string;
		onmouseup?: string;
		onpaste?: string;
		onpause?: string;
		onplay?: string;
		onplaying?: string;
		onpointercancel?: string;
		onpointerdown?: string;
		onpointerenter?: string;
		onpointerleave?: string;
		onpointermove?: string;
		onpointerout?: string;
		onpointerover?: string;
		onpointerup?: string;
		onprogress?: string;
		onratechange?: string;
		onreset?: string;
		onscroll?: string;
		onseeked?: string;
		onseeking?: string;
		onselect?: string;
		onstalled?: string;
		onsubmit?: string;
		onsuspend?: string;
		ontimeupdate?: string;
		ontouchcancel?: string;
		ontouchend?: string;
		ontouchmove?: string;
		ontouchstart?: string;
		ontransitionend?: string;
		onvolumechange?: string;
		onwaiting?: string;
		onwheel?: string;
	}
	type HTMLAutocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
	type HTMLAutocomplete = 'additional-name' | 'address-level1' | 'address-level2' | 'address-level3' | 'address-level4' | 'address-line1' | 'address-line2' | 'address-line3' | 'bday' | 'bday-year' | 'bday-day' | 'bday-month' | 'billing' | 'cc-additional-name' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-family-name' | 'cc-given-name' | 'cc-name' | 'cc-number' | 'cc-type' | 'country' | 'country-name' | 'current-password' | 'email' | 'family-name' | 'fax' | 'given-name' | 'home' | 'honorific-prefix' | 'honorific-suffix' | 'impp' | 'language' | 'mobile' | 'name' | 'new-password' | 'nickname' | 'organization' | 'organization-title' | 'pager' | 'photo' | 'postal-code' | 'sex' | 'shipping' | 'street-address' | 'tel-area-code' | 'tel' | 'tel-country-code' | 'tel-extension' | 'tel-local' | 'tel-local-prefix' | 'tel-local-suffix' | 'tel-national' | 'transaction-amount' | 'transaction-currency' | 'url' | 'username' | 'work';
	type HTMLCrossorigin = 'anonymous' | 'use-credentials' | '';
	type HTMLDir = 'ltr' | 'rtl' | 'auto';
	type HTMLFormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
	type HTMLFormMethod = 'post' | 'get' | 'dialog';
	type HTMLIframeSandbox = 'allow-downloads-without-user-activation' | 'allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-storage-access-by-user-activation' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation';
	type HTMLLinkAs = 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'video' | 'worker';
	type HTMLReferrerPolicy = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
	type HTMLRole = 'alert' | 'alertdialog' | 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' | 'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'command' | 'complementary' | 'composite' | 'contentinfo' | 'definition' | 'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' | 'gridcell' | 'group' | 'heading' | 'img' | 'input' | 'insertion' | 'landmark' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'meter' | 'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' | 'range' | 'region' | 'roletype' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'section' | 'sectionhead' | 'select' | 'separator' | 'slider' | 'spinbutton' | 'status' | 'strong' | 'structure' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem' | 'widget' | 'window';
	interface HTMLAttrs extends AriaAttrs, DOMAttrs {
		accesskey?: string;
		autocapitalize?: HTMLAutocapitalize;
		autofocus?: boolean;
		class?: string;
		contenteditable?: 'true' | 'false';
		contextmenu?: string;
		dir?: HTMLDir;
		draggable?: 'true' | 'false';
		enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
		exportparts?: string;
		hidden?: boolean;
		id?: string;
		inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
		is?: string;
		itemid?: string;
		itemprop?: string;
		itemref?: number | string | (number | string)[];
		itemscope?: boolean;
		itemtype?: string;
		lang?: string;
		nonce?: string;
		part?: string;
		role?: HTMLRole;
		slot?: string;
		spellcheck?: 'true' | 'false';
		style?: string | false | null;
		tabindex?: number | string;
		title?: string;
		translate?: 'true' | 'false';
		'xml:base'?: string;
		'xml:lang'?: string;
	}
	interface HTMLAAttrs extends HTMLAttrs {
		charset?: string;
		coords?: string;
		download?: string;
		href?: string;
		hreflang?: string;
		name?: string;
		ping?: number | string | (number | string)[];
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		rev?: string;
		shape?: string;
		target?: string;
		type?: string;
	}
	interface HTMLAreaAttrs extends HTMLAttrs {
		alt?: string;
		coords?: string;
		download?: string;
		href?: string;
		hreflang?: string;
		name?: string;
		nohref?: string;
		ping?: number | string | (number | string)[];
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		shape?: 'rect' | 'circle' | 'poly' | 'default';
		target?: string;
		type?: string;
	}
	interface HTMLAudioAttrs extends HTMLAttrs {
		autoplay?: boolean;
		controls?: boolean;
		crossorigin?: HTMLCrossorigin;
		disableremoteplayback?: string;
		loop?: boolean;
		muted?: boolean;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
	}
	interface HTMLBaseAttrs extends HTMLAttrs {
		href?: string;
		target?: string;
	}
	interface HTMLBdoAttrs extends HTMLAttrs {
	}
	interface HTMLBlockquoteAttrs extends HTMLAttrs {
		cite?: string;
	}
	interface HTMLBodyAttrs extends HTMLAttrs {
		alink?: string;
		background?: string;
		bgcolor?: string;
		bottommargin?: string;
		leftmargin?: string;
		link?: string;
		onafterprint?: string;
		onbeforeprint?: string;
		onbeforeunload?: string;
		onhashchange?: string;
		onlanguagechange?: string;
		onmessage?: string;
		onmessageerror?: string;
		onoffline?: string;
		ononline?: string;
		onpagehide?: string;
		onpageshow?: string;
		onpopstate?: string;
		onredo?: string;
		onrejectionhandled?: string;
		onstorage?: string;
		onundo?: string;
		onunhandledrejection?: string;
		onunload?: string;
		rightmargin?: string;
		text?: string;
		topmargin?: string;
		vlink?: string;
	}
	interface HTMLBrAttrs extends HTMLAttrs {
		clear?: string;
	}
	interface HTMLButtonAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		disabled?: boolean;
		form?: string;
		formaction?: string;
		formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
		formmethod?: HTMLFormMethod;
		formnovalidate?: boolean;
		formtarget?: string;
		name?: string;
		type?: string;
		value?: number | string;
	}
	interface HTMLCanvasAttrs extends HTMLAttrs {
		height?: number | string;
		'moz-opaque'?: string;
		width?: number | string;
	}
	interface HTMLCaptionAttrs extends HTMLAttrs {
		align?: string;
	}
	interface HTMLColAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		span?: number | string;
		valign?: string;
		width?: string;
	}
	interface HTMLColgroupAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		span?: number | string;
		valign?: string;
	}
	interface HTMLDataAttrs extends HTMLAttrs {
		value?: number | string;
	}
	interface HTMLDdAttrs extends HTMLAttrs {
		nowrap?: string;
	}
	interface HTMLDelAttrs extends HTMLAttrs {
		cite?: string;
		datetime?: string;
	}
	interface HTMLDetailsAttrs extends HTMLAttrs {
		open?: boolean;
	}
	interface HTMLDialogAttrs extends HTMLAttrs {
		open?: boolean;
	}
	interface HTMLEmbedAttrs extends HTMLAttrs {
		height?: number | string;
		src?: string;
		type?: string;
		width?: number | string;
	}
	interface HTMLFieldsetAttrs extends HTMLAttrs {
		disabled?: boolean;
		form?: string;
		name?: string;
	}
	interface HTMLFormAttrs extends HTMLAttrs {
		accept?: string;
		'accept-charset'?: string;
		action?: string;
		autocomplete?: HTMLAutocomplete;
		enctype?: HTMLFormEncType;
		method?: HTMLFormMethod;
		name?: string;
		novalidate?: boolean;
		rel?: number | string | (number | string)[];
		target?: string;
	}
	interface HTMLHeadAttrs extends HTMLAttrs {
		profile?: string;
	}
	interface HTMLHrAttrs extends HTMLAttrs {
		align?: string;
		color?: string;
		noshade?: string;
		size?: string;
		width?: string;
	}
	interface HTMLHtmlAttrs extends HTMLAttrs {
		manifest?: string;
		version?: string;
		xmlns?: string;
	}
	interface HTMLIframeAttrs extends HTMLAttrs {
		align?: string;
		allow?: string;
		allowfullscreen?: boolean;
		allowpaymentrequest?: boolean;
		csp?: string;
		frameborder?: string;
		height?: number | string;
		loading?: 'eager' | 'lazy';
		longdesc?: string;
		marginheight?: string;
		marginwidth?: string;
		mozbrowser?: string;
		name?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		sandbox?: HTMLIframeSandbox;
		scrolling?: string;
		src?: string;
		srcdoc?: string;
		width?: number | string;
	}
	interface HTMLImgAttrs extends HTMLAttrs {
		align?: string;
		alt?: string;
		border?: string;
		crossorigin?: HTMLCrossorigin;
		decoding?: 'sync' | 'async' | 'auto';
		height?: number | string;
		hspace?: string;
		intrinsicsize?: string;
		ismap?: boolean;
		loading?: 'eager' | 'lazy';
		longdesc?: string;
		name?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		sizes?: number | string | (number | string)[];
		src?: string;
		srcset?: string;
		usemap?: string;
		vspace?: string;
		width?: number | string;
	}
	interface HTMLInputAttrs extends HTMLAttrs {
		accept?: number | string | (number | string)[];
		alt?: string;
		autocomplete?: HTMLAutocomplete;
		autocorrect?: string;
		capture?: string;
		checked?: boolean;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		formaction?: string;
		formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
		formmethod?: HTMLFormMethod;
		formnovalidate?: boolean;
		formtarget?: string;
		height?: number | string;
		incremental?: string;
		list?: string;
		max?: number | string;
		maxlength?: number | string;
		min?: number | string;
		minlength?: number | string;
		mozactionhint?: string;
		multiple?: boolean;
		name?: string;
		orient?: string;
		pattern?: string;
		placeholder?: string;
		readonly?: boolean;
		required?: boolean;
		results?: string;
		size?: number | string;
		src?: string;
		step?: number | string;
		type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' | (string & {});
		value?: number | string;
		webkitdirectory?: string;
		width?: number | string;
	}
	interface HTMLInsAttrs extends HTMLAttrs {
		cite?: string;
		datetime?: string;
	}
	interface HTMLLabelAttrs extends HTMLAttrs {
		for?: string;
		form?: string;
	}
	interface HTMLLiAttrs extends HTMLAttrs {
		type?: string;
		value?: number | string;
	}
	interface HTMLLinkAttrs extends HTMLAttrs {
		as?: HTMLLinkAs;
		charset?: string;
		color?: string;
		crossorigin?: HTMLCrossorigin;
		disabled?: string;
		href?: string;
		hreflang?: string;
		imagesizes?: number | string | (number | string)[];
		imagesrcset?: string;
		integrity?: string;
		media?: number | string | (number | string)[];
		methods?: string;
		prefetch?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		rev?: string;
		sizes?: string;
		target?: string;
		type?: string;
	}
	interface HTMLMapAttrs extends HTMLAttrs {
		name?: string;
	}
	interface HTMLMetaAttrs extends HTMLAttrs {
		charset?: string;
		content?: string;
		'http-equiv'?: 'content-type' | 'default-style' | 'refresh' | 'x-ua-compatible' | 'content-security-policy';
		media?: number | string | (number | string)[];
		name?: string;
	}
	interface HTMLMeterAttrs extends HTMLAttrs {
		form?: string;
		high?: number | string;
		low?: number | string;
		max?: number | string;
		min?: number | string;
		optimum?: number | string;
		value?: number | string;
	}
	interface HTMLObjectAttrs extends HTMLAttrs {
		archive?: string;
		border?: string;
		classid?: string;
		codebase?: string;
		codetype?: string;
		data?: string;
		declare?: string;
		form?: string;
		height?: number | string;
		name?: string;
		standby?: string;
		type?: string;
		usemap?: string;
		width?: number | string;
	}
	interface HTMLOlAttrs extends HTMLAttrs {
		reversed?: boolean;
		start?: number | string;
		type?: string;
	}
	interface HTMLOptgroupAttrs extends HTMLAttrs {
		disabled?: boolean;
		label?: string;
	}
	interface HTMLOptionAttrs extends HTMLAttrs {
		disabled?: boolean;
		label?: string;
		selected?: boolean;
		value?: number | string;
	}
	interface HTMLOutputAttrs extends HTMLAttrs {
		for?: string;
		form?: string;
		name?: string;
	}
	interface HTMLPreAttrs extends HTMLAttrs {
		cols?: string;
		width?: string;
		wrap?: string;
	}
	interface HTMLProgressAttrs extends HTMLAttrs {
		max?: number | string;
		value?: number | string;
	}
	interface HTMLQAttrs extends HTMLAttrs {
		cite?: string;
	}
	interface HTMLScriptAttrs extends HTMLAttrs {
		async?: boolean;
		charset?: string;
		crossorigin?: HTMLCrossorigin;
		defer?: boolean;
		integrity?: string;
		language?: string;
		nomodule?: boolean;
		referrerpolicy?: HTMLReferrerPolicy;
		src?: string;
		type?: string;
	}
	interface HTMLSelectAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		disabled?: boolean;
		form?: string;
		multiple?: boolean;
		name?: string;
		required?: boolean;
		size?: number | string;
	}
	interface HTMLSlotAttrs extends HTMLAttrs {
		name?: string;
	}
	interface HTMLSourceAttrs extends HTMLAttrs {
		media?: number | string | (number | string)[];
		sizes?: number | string | (number | string)[];
		src?: string;
		srcset?: string;
		type?: string;
	}
	interface HTMLStyleAttrs extends HTMLAttrs {
		media?: string;
		scoped?: string;
		type?: string;
	}
	interface HTMLTableAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		border?: string;
		cellpadding?: string;
		cellspacing?: string;
		frame?: string;
		rules?: string;
		summary?: string;
		width?: string;
	}
	interface HTMLTbodyAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTdAttrs extends HTMLAttrs {
		abbr?: string;
		align?: string;
		axis?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		colspan?: string;
		headers?: number | string | (number | string)[];
		height?: string;
		rowspan?: string;
		scope?: string;
		valign?: string;
		width?: string;
	}
	interface HTMLTextareaAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		autocorrect?: string;
		cols?: number | string;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		maxlength?: number | string;
		minlength?: number | string;
		name?: string;
		placeholder?: string;
		readonly?: boolean;
		required?: boolean;
		rows?: number | string;
		wrap?: 'soft' | 'hard';
	}
	interface HTMLTfootAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLThAttrs extends HTMLAttrs {
		abbr?: string;
		align?: string;
		axis?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		colspan?: string;
		headers?: number | string | (number | string)[];
		height?: string;
		rowspan?: string;
		scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto';
		valign?: string;
		width?: string;
	}
	interface HTMLTheadAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTimeAttrs extends HTMLAttrs {
		datetime?: string;
		default?: boolean;
		kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
		label?: string;
		src?: string;
		srclang?: string;
	}
	interface HTMLTrAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTrackAttrs extends HTMLAttrs {
		default?: string;
		kind?: string;
		label?: string;
		src?: string;
		srclang?: string;
	}
	interface HTMLUlAttrs extends HTMLAttrs {
		compact?: string;
		type?: string;
	}
	interface HTMLVideoAttrs extends HTMLAttrs {
		autopictureinpicture?: string;
		autoplay?: boolean;
		controls?: boolean;
		controlslist?: 'nodownload' | 'nofullscreen' | 'noremoteplayback';
		crossorigin?: HTMLCrossorigin;
		disablepictureinpicture?: string;
		disableremoteplayback?: string;
		height?: number | string;
		loop?: boolean;
		muted?: boolean;
		playsinline?: boolean;
		poster?: string;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
		width?: number | string;
	}
	type TypeMap = HTMLElementTagNameMap;
	interface AttrsMap {
		a: HTMLAAttrs;
		area: HTMLAreaAttrs;
		audio: HTMLAudioAttrs;
		base: HTMLBaseAttrs;
		bdo: HTMLBdoAttrs;
		blockquote: HTMLBlockquoteAttrs;
		body: HTMLBodyAttrs;
		br: HTMLBrAttrs;
		button: HTMLButtonAttrs;
		canvas: HTMLCanvasAttrs;
		caption: HTMLCaptionAttrs;
		col: HTMLColAttrs;
		colgroup: HTMLColgroupAttrs;
		data: HTMLDataAttrs;
		dd: HTMLDdAttrs;
		del: HTMLDelAttrs;
		details: HTMLDetailsAttrs;
		dialog: HTMLDialogAttrs;
		embed: HTMLEmbedAttrs;
		fieldset: HTMLFieldsetAttrs;
		form: HTMLFormAttrs;
		head: HTMLHeadAttrs;
		hr: HTMLHrAttrs;
		html: HTMLHtmlAttrs;
		iframe: HTMLIframeAttrs;
		img: HTMLImgAttrs;
		input: HTMLInputAttrs;
		ins: HTMLInsAttrs;
		label: HTMLLabelAttrs;
		li: HTMLLiAttrs;
		link: HTMLLinkAttrs;
		map: HTMLMapAttrs;
		meta: HTMLMetaAttrs;
		meter: HTMLMeterAttrs;
		object: HTMLObjectAttrs;
		ol: HTMLOlAttrs;
		optgroup: HTMLOptgroupAttrs;
		option: HTMLOptionAttrs;
		output: HTMLOutputAttrs;
		pre: HTMLPreAttrs;
		progress: HTMLProgressAttrs;
		q: HTMLQAttrs;
		script: HTMLScriptAttrs;
		select: HTMLSelectAttrs;
		slot: HTMLSlotAttrs;
		source: HTMLSourceAttrs;
		style: HTMLStyleAttrs;
		table: HTMLTableAttrs;
		tbody: HTMLTbodyAttrs;
		td: HTMLTdAttrs;
		textarea: HTMLTextareaAttrs;
		tfoot: HTMLTfootAttrs;
		th: HTMLThAttrs;
		thead: HTMLTheadAttrs;
		time: HTMLTimeAttrs;
		tr: HTMLTrAttrs;
		track: HTMLTrackAttrs;
		ul: HTMLUlAttrs;
		video: HTMLVideoAttrs;
		[unknown: string]: HTMLAttrs;
	}
	interface EventMap {
		body: HTMLBodyElementEventMap;
		audio: HTMLMediaElementEventMap;
		video: HTMLVideoElementEventMap;
		[unknown: string]: HTMLElementEventMap;
	}

	export {};
}

declare module '@neocomp/full/rawdom/elements' {
	export const a: (...params: CreateParam<"a">[]) => HTMLAnchorElement;
	export const abbr: (...params: CreateParam<"abbr">[]) => HTMLElement;
	export const address: (...params: CreateParam<"address">[]) => HTMLElement;
	export const area: (...params: CreateParam<"area">[]) => HTMLAreaElement;
	export const article: (...params: CreateParam<"article">[]) => HTMLElement;
	export const aside: (...params: CreateParam<"aside">[]) => HTMLElement;
	export const audio: (...params: CreateParam<"audio">[]) => HTMLAudioElement;
	export const b: (...params: CreateParam<"b">[]) => HTMLElement;
	export const base: (...params: CreateParam<"base">[]) => HTMLBaseElement;
	export const bdi: (...params: CreateParam<"bdi">[]) => HTMLElement;
	export const bdo: (...params: CreateParam<"bdo">[]) => HTMLElement;
	export const blockquote: (...params: CreateParam<"blockquote">[]) => HTMLQuoteElement;
	export const body: (...params: CreateParam<"body">[]) => HTMLBodyElement;
	export const br: (...params: CreateParam<"br">[]) => HTMLBRElement;
	export const button: (...params: CreateParam<"button">[]) => HTMLButtonElement;
	export const canvas: (...params: CreateParam<"canvas">[]) => HTMLCanvasElement;
	export const caption: (...params: CreateParam<"caption">[]) => HTMLTableCaptionElement;
	export const cite: (...params: CreateParam<"cite">[]) => HTMLElement;
	export const code: (...params: CreateParam<"code">[]) => HTMLElement;
	export const col: (...params: CreateParam<"col">[]) => HTMLTableColElement;
	export const colgroup: (...params: CreateParam<"colgroup">[]) => HTMLTableColElement;
	export const data: (...params: CreateParam<"data">[]) => HTMLDataElement;
	export const datalist: (...params: CreateParam<"datalist">[]) => HTMLDataListElement;
	export const dd: (...params: CreateParam<"dd">[]) => HTMLElement;
	export const del: (...params: CreateParam<"del">[]) => HTMLModElement;
	export const details: (...params: CreateParam<"details">[]) => HTMLDetailsElement;
	export const dfn: (...params: CreateParam<"dfn">[]) => HTMLElement;
	export const dialog: (...params: CreateParam<"dialog">[]) => HTMLDialogElement;
	export const div: (...params: CreateParam<"div">[]) => HTMLDivElement;
	export const dl: (...params: CreateParam<"dl">[]) => HTMLDListElement;
	export const dt: (...params: CreateParam<"dt">[]) => HTMLElement;
	export const em: (...params: CreateParam<"em">[]) => HTMLElement;
	export const embed: (...params: CreateParam<"embed">[]) => HTMLEmbedElement;
	export const fieldset: (...params: CreateParam<"fieldset">[]) => HTMLFieldSetElement;
	export const figcaption: (...params: CreateParam<"figcaption">[]) => HTMLElement;
	export const figure: (...params: CreateParam<"figure">[]) => HTMLElement;
	export const footer: (...params: CreateParam<"footer">[]) => HTMLElement;
	export const form: (...params: CreateParam<"form">[]) => HTMLFormElement;
	export const h1: (...params: CreateParam<"h1">[]) => HTMLHeadingElement;
	export const h2: (...params: CreateParam<"h2">[]) => HTMLHeadingElement;
	export const h3: (...params: CreateParam<"h3">[]) => HTMLHeadingElement;
	export const h4: (...params: CreateParam<"h4">[]) => HTMLHeadingElement;
	export const h5: (...params: CreateParam<"h5">[]) => HTMLHeadingElement;
	export const h6: (...params: CreateParam<"h6">[]) => HTMLHeadingElement;
	export const head: (...params: CreateParam<"head">[]) => HTMLHeadElement;
	export const header: (...params: CreateParam<"header">[]) => HTMLElement;
	export const hgroup: (...params: CreateParam<"hgroup">[]) => HTMLElement;
	export const hr: (...params: CreateParam<"hr">[]) => HTMLHRElement;
	export const html: (...params: CreateParam<"html">[]) => HTMLHtmlElement;
	export const i: (...params: CreateParam<"i">[]) => HTMLElement;
	export const iframe: (...params: CreateParam<"iframe">[]) => HTMLIFrameElement;
	export const img: (...params: CreateParam<"img">[]) => HTMLImageElement;
	export const input: (...params: CreateParam<"input">[]) => HTMLInputElement;
	export const ins: (...params: CreateParam<"ins">[]) => HTMLModElement;
	export const kbd: (...params: CreateParam<"kbd">[]) => HTMLElement;
	export const label: (...params: CreateParam<"label">[]) => HTMLLabelElement;
	export const legend: (...params: CreateParam<"legend">[]) => HTMLLegendElement;
	export const li: (...params: CreateParam<"li">[]) => HTMLLIElement;
	export const link: (...params: CreateParam<"link">[]) => HTMLLinkElement;
	export const main: (...params: CreateParam<"main">[]) => HTMLElement;
	export const map: (...params: CreateParam<"map">[]) => HTMLMapElement;
	export const mark: (...params: CreateParam<"mark">[]) => HTMLElement;
	export const menu: (...params: CreateParam<"menu">[]) => HTMLMenuElement;
	export const meta: (...params: CreateParam<"meta">[]) => HTMLMetaElement;
	export const meter: (...params: CreateParam<"meter">[]) => HTMLMeterElement;
	export const nav: (...params: CreateParam<"nav">[]) => HTMLElement;
	export const noscript: (...params: CreateParam<"noscript">[]) => HTMLElement;
	export const object: (...params: CreateParam<"object">[]) => HTMLObjectElement;
	export const ol: (...params: CreateParam<"ol">[]) => HTMLOListElement;
	export const optgroup: (...params: CreateParam<"optgroup">[]) => HTMLOptGroupElement;
	export const option: (...params: CreateParam<"option">[]) => HTMLOptionElement;
	export const output: (...params: CreateParam<"output">[]) => HTMLOutputElement;
	export const p: (...params: CreateParam<"p">[]) => HTMLParagraphElement;
	export const picture: (...params: CreateParam<"picture">[]) => HTMLPictureElement;
	export const pre: (...params: CreateParam<"pre">[]) => HTMLPreElement;
	export const progress: (...params: CreateParam<"progress">[]) => HTMLProgressElement;
	export const q: (...params: CreateParam<"q">[]) => HTMLQuoteElement;
	export const rp: (...params: CreateParam<"rp">[]) => HTMLElement;
	export const rt: (...params: CreateParam<"rt">[]) => HTMLElement;
	export const ruby: (...params: CreateParam<"ruby">[]) => HTMLElement;
	export const s: (...params: CreateParam<"s">[]) => HTMLElement;
	export const samp: (...params: CreateParam<"samp">[]) => HTMLElement;
	export const script: (...params: CreateParam<"script">[]) => HTMLScriptElement;
	export const search: (...params: CreateParam<"search">[]) => HTMLElement;
	export const section: (...params: CreateParam<"section">[]) => HTMLElement;
	export const select: (...params: CreateParam<"select">[]) => HTMLSelectElement;
	export const slot: (...params: CreateParam<"slot">[]) => HTMLSlotElement;
	export const small: (...params: CreateParam<"small">[]) => HTMLElement;
	export const source: (...params: CreateParam<"source">[]) => HTMLSourceElement;
	export const span: (...params: CreateParam<"span">[]) => HTMLSpanElement;
	export const strong: (...params: CreateParam<"strong">[]) => HTMLElement;
	export const style: (...params: CreateParam<"style">[]) => HTMLStyleElement;
	export const sub: (...params: CreateParam<"sub">[]) => HTMLElement;
	export const summary: (...params: CreateParam<"summary">[]) => HTMLElement;
	export const sup: (...params: CreateParam<"sup">[]) => HTMLElement;
	export const table: (...params: CreateParam<"table">[]) => HTMLTableElement;
	export const tbody: (...params: CreateParam<"tbody">[]) => HTMLTableSectionElement;
	export const td: (...params: CreateParam<"td">[]) => HTMLTableCellElement;
	export const template: (...params: CreateParam<"template">[]) => HTMLTemplateElement;
	export const textarea: (...params: CreateParam<"textarea">[]) => HTMLTextAreaElement;
	export const tfoot: (...params: CreateParam<"tfoot">[]) => HTMLTableSectionElement;
	export const th: (...params: CreateParam<"th">[]) => HTMLTableCellElement;
	export const thead: (...params: CreateParam<"thead">[]) => HTMLTableSectionElement;
	export const time: (...params: CreateParam<"time">[]) => HTMLTimeElement;
	export const title: (...params: CreateParam<"title">[]) => HTMLTitleElement;
	export const tr: (...params: CreateParam<"tr">[]) => HTMLTableRowElement;
	export const track: (...params: CreateParam<"track">[]) => HTMLTrackElement;
	export const u: (...params: CreateParam<"u">[]) => HTMLElement;
	export const ul: (...params: CreateParam<"ul">[]) => HTMLUListElement;
	export const Var: (...params: CreateParam<"var">[]) => HTMLElement;
	export const video: (...params: CreateParam<"video">[]) => HTMLVideoElement;
	export const wbr: (...params: CreateParam<"wbr">[]) => HTMLElement;
	type CreateParam<E extends keyof TypeMap> = string | Node | undefined | null | false | ((el: HTMLElement) => CreateParam<E>) | CreateObject<E> | CreateParam<E>[];
	type CreateObject<E extends keyof TypeMap> = {
		classList?: string[];
		style?: {
			[K in keyof CSSStyleDeclaration]?: string;
		};
		attrs?: AttrsMap[E] & {
			[attr: string]: string | number | boolean;
		};
		events?: {
			[K in keyof EventMap[E]]?: (this: TypeMap[E], evn: EventMap[E][K]) => void;
		} & {
			[type: string]: (this: TypeMap[E], evn: Event) => void;
		};
		[prop: string]: any;
	} & {
		[K in Exclude<keyof TypeMap[E], 'style'>]?: TypeMap[E][K];
	};
	interface AriaAttrs {
		'aria-activedescendant'?: string;
		'aria-atomic'?: boolean | 'false' | 'true';
		'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
		'aria-busy'?: boolean | 'false' | 'true';
		'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
		'aria-colcount'?: number;
		'aria-colindex'?: number;
		'aria-colspan'?: number;
		'aria-controls'?: string;
		'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
		'aria-describedby'?: string;
		'aria-details'?: string;
		'aria-disabled'?: boolean | 'false' | 'true';
		'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
		'aria-errormessage'?: string;
		'aria-expanded'?: boolean | 'false' | 'true';
		'aria-flowto'?: string;
		'aria-grabbed'?: boolean | 'false' | 'true';
		'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
		'aria-hidden'?: boolean | 'false' | 'true';
		'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
		'aria-keyshortcuts'?: string;
		'aria-label'?: string;
		'aria-labelledby'?: string;
		'aria-level'?: number;
		'aria-live'?: 'off' | 'assertive' | 'polite';
		'aria-modal'?: boolean | 'false' | 'true';
		'aria-multiline'?: boolean | 'false' | 'true';
		'aria-multiselectable'?: boolean | 'false' | 'true';
		'aria-orientation'?: 'horizontal' | 'vertical';
		'aria-owns'?: string;
		'aria-placeholder'?: string;
		'aria-posinset'?: number;
		'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
		'aria-readonly'?: boolean | 'false' | 'true';
		'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals';
		'aria-required'?: boolean | 'false' | 'true';
		'aria-roledescription'?: string;
		'aria-rowcount'?: number;
		'aria-rowindex'?: number;
		'aria-rowspan'?: number;
		'aria-selected'?: boolean | 'false' | 'true';
		'aria-setsize'?: number;
		'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
		'aria-valuemax'?: number;
		'aria-valuemin'?: number;
		'aria-valuenow'?: number;
		'aria-valuetext'?: string;
	}
	interface DOMAttrs {
		onabort?: string;
		onanimationend?: string;
		onanimationiteration?: string;
		onanimationstart?: string;
		onblur?: string;
		oncanplay?: string;
		oncanplaythrough?: string;
		onchange?: string;
		onclick?: string;
		oncompositionend?: string;
		oncompositionstart?: string;
		oncompositionupdate?: string;
		oncontextmenu?: string;
		oncopy?: string;
		oncut?: string;
		ondblclick?: string;
		ondrag?: string;
		ondragend?: string;
		ondragenter?: string;
		ondragexit?: string;
		ondragleave?: string;
		ondragover?: string;
		ondragstart?: string;
		ondrop?: string;
		ondurationchange?: string;
		onemptied?: string;
		onencrypted?: string;
		onended?: string;
		onerror?: string;
		onfocus?: string;
		ongotpointercapture?: string;
		oninput?: string;
		onkeydown?: string;
		onkeypress?: string;
		onkeyup?: string;
		onload?: string;
		onloadeddata?: string;
		onloadedmetadata?: string;
		onloadstart?: string;
		onlostpointercapture?: string;
		onmousedown?: string;
		onmouseenter?: string;
		onmouseleave?: string;
		onmousemove?: string;
		onmouseout?: string;
		onmouseover?: string;
		onmouseup?: string;
		onpaste?: string;
		onpause?: string;
		onplay?: string;
		onplaying?: string;
		onpointercancel?: string;
		onpointerdown?: string;
		onpointerenter?: string;
		onpointerleave?: string;
		onpointermove?: string;
		onpointerout?: string;
		onpointerover?: string;
		onpointerup?: string;
		onprogress?: string;
		onratechange?: string;
		onreset?: string;
		onscroll?: string;
		onseeked?: string;
		onseeking?: string;
		onselect?: string;
		onstalled?: string;
		onsubmit?: string;
		onsuspend?: string;
		ontimeupdate?: string;
		ontouchcancel?: string;
		ontouchend?: string;
		ontouchmove?: string;
		ontouchstart?: string;
		ontransitionend?: string;
		onvolumechange?: string;
		onwaiting?: string;
		onwheel?: string;
	}
	type HTMLAutocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
	type HTMLAutocomplete = 'additional-name' | 'address-level1' | 'address-level2' | 'address-level3' | 'address-level4' | 'address-line1' | 'address-line2' | 'address-line3' | 'bday' | 'bday-year' | 'bday-day' | 'bday-month' | 'billing' | 'cc-additional-name' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-family-name' | 'cc-given-name' | 'cc-name' | 'cc-number' | 'cc-type' | 'country' | 'country-name' | 'current-password' | 'email' | 'family-name' | 'fax' | 'given-name' | 'home' | 'honorific-prefix' | 'honorific-suffix' | 'impp' | 'language' | 'mobile' | 'name' | 'new-password' | 'nickname' | 'organization' | 'organization-title' | 'pager' | 'photo' | 'postal-code' | 'sex' | 'shipping' | 'street-address' | 'tel-area-code' | 'tel' | 'tel-country-code' | 'tel-extension' | 'tel-local' | 'tel-local-prefix' | 'tel-local-suffix' | 'tel-national' | 'transaction-amount' | 'transaction-currency' | 'url' | 'username' | 'work';
	type HTMLCrossorigin = 'anonymous' | 'use-credentials' | '';
	type HTMLDir = 'ltr' | 'rtl' | 'auto';
	type HTMLFormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
	type HTMLFormMethod = 'post' | 'get' | 'dialog';
	type HTMLIframeSandbox = 'allow-downloads-without-user-activation' | 'allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-storage-access-by-user-activation' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation';
	type HTMLLinkAs = 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'video' | 'worker';
	type HTMLReferrerPolicy = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
	type HTMLRole = 'alert' | 'alertdialog' | 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' | 'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'command' | 'complementary' | 'composite' | 'contentinfo' | 'definition' | 'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' | 'gridcell' | 'group' | 'heading' | 'img' | 'input' | 'insertion' | 'landmark' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'meter' | 'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' | 'range' | 'region' | 'roletype' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'section' | 'sectionhead' | 'select' | 'separator' | 'slider' | 'spinbutton' | 'status' | 'strong' | 'structure' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem' | 'widget' | 'window';
	interface HTMLAttrs extends AriaAttrs, DOMAttrs {
		accesskey?: string;
		autocapitalize?: HTMLAutocapitalize;
		autofocus?: boolean;
		class?: string;
		contenteditable?: 'true' | 'false';
		contextmenu?: string;
		dir?: HTMLDir;
		draggable?: 'true' | 'false';
		enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
		exportparts?: string;
		hidden?: boolean;
		id?: string;
		inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
		is?: string;
		itemid?: string;
		itemprop?: string;
		itemref?: number | string | (number | string)[];
		itemscope?: boolean;
		itemtype?: string;
		lang?: string;
		nonce?: string;
		part?: string;
		role?: HTMLRole;
		slot?: string;
		spellcheck?: 'true' | 'false';
		style?: string | false | null;
		tabindex?: number | string;
		title?: string;
		translate?: 'true' | 'false';
		'xml:base'?: string;
		'xml:lang'?: string;
	}
	interface HTMLAAttrs extends HTMLAttrs {
		charset?: string;
		coords?: string;
		download?: string;
		href?: string;
		hreflang?: string;
		name?: string;
		ping?: number | string | (number | string)[];
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		rev?: string;
		shape?: string;
		target?: string;
		type?: string;
	}
	interface HTMLAreaAttrs extends HTMLAttrs {
		alt?: string;
		coords?: string;
		download?: string;
		href?: string;
		hreflang?: string;
		name?: string;
		nohref?: string;
		ping?: number | string | (number | string)[];
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		shape?: 'rect' | 'circle' | 'poly' | 'default';
		target?: string;
		type?: string;
	}
	interface HTMLAudioAttrs extends HTMLAttrs {
		autoplay?: boolean;
		controls?: boolean;
		crossorigin?: HTMLCrossorigin;
		disableremoteplayback?: string;
		loop?: boolean;
		muted?: boolean;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
	}
	interface HTMLBaseAttrs extends HTMLAttrs {
		href?: string;
		target?: string;
	}
	interface HTMLBdoAttrs extends HTMLAttrs {
	}
	interface HTMLBlockquoteAttrs extends HTMLAttrs {
		cite?: string;
	}
	interface HTMLBodyAttrs extends HTMLAttrs {
		alink?: string;
		background?: string;
		bgcolor?: string;
		bottommargin?: string;
		leftmargin?: string;
		link?: string;
		onafterprint?: string;
		onbeforeprint?: string;
		onbeforeunload?: string;
		onhashchange?: string;
		onlanguagechange?: string;
		onmessage?: string;
		onmessageerror?: string;
		onoffline?: string;
		ononline?: string;
		onpagehide?: string;
		onpageshow?: string;
		onpopstate?: string;
		onredo?: string;
		onrejectionhandled?: string;
		onstorage?: string;
		onundo?: string;
		onunhandledrejection?: string;
		onunload?: string;
		rightmargin?: string;
		text?: string;
		topmargin?: string;
		vlink?: string;
	}
	interface HTMLBrAttrs extends HTMLAttrs {
		clear?: string;
	}
	interface HTMLButtonAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		disabled?: boolean;
		form?: string;
		formaction?: string;
		formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
		formmethod?: HTMLFormMethod;
		formnovalidate?: boolean;
		formtarget?: string;
		name?: string;
		type?: string;
		value?: number | string;
	}
	interface HTMLCanvasAttrs extends HTMLAttrs {
		height?: number | string;
		'moz-opaque'?: string;
		width?: number | string;
	}
	interface HTMLCaptionAttrs extends HTMLAttrs {
		align?: string;
	}
	interface HTMLColAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		span?: number | string;
		valign?: string;
		width?: string;
	}
	interface HTMLColgroupAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		span?: number | string;
		valign?: string;
	}
	interface HTMLDataAttrs extends HTMLAttrs {
		value?: number | string;
	}
	interface HTMLDdAttrs extends HTMLAttrs {
		nowrap?: string;
	}
	interface HTMLDelAttrs extends HTMLAttrs {
		cite?: string;
		datetime?: string;
	}
	interface HTMLDetailsAttrs extends HTMLAttrs {
		open?: boolean;
	}
	interface HTMLDialogAttrs extends HTMLAttrs {
		open?: boolean;
	}
	interface HTMLEmbedAttrs extends HTMLAttrs {
		height?: number | string;
		src?: string;
		type?: string;
		width?: number | string;
	}
	interface HTMLFieldsetAttrs extends HTMLAttrs {
		disabled?: boolean;
		form?: string;
		name?: string;
	}
	interface HTMLFormAttrs extends HTMLAttrs {
		accept?: string;
		'accept-charset'?: string;
		action?: string;
		autocomplete?: HTMLAutocomplete;
		enctype?: HTMLFormEncType;
		method?: HTMLFormMethod;
		name?: string;
		novalidate?: boolean;
		rel?: number | string | (number | string)[];
		target?: string;
	}
	interface HTMLHeadAttrs extends HTMLAttrs {
		profile?: string;
	}
	interface HTMLHrAttrs extends HTMLAttrs {
		align?: string;
		color?: string;
		noshade?: string;
		size?: string;
		width?: string;
	}
	interface HTMLHtmlAttrs extends HTMLAttrs {
		manifest?: string;
		version?: string;
		xmlns?: string;
	}
	interface HTMLIframeAttrs extends HTMLAttrs {
		align?: string;
		allow?: string;
		allowfullscreen?: boolean;
		allowpaymentrequest?: boolean;
		csp?: string;
		frameborder?: string;
		height?: number | string;
		loading?: 'eager' | 'lazy';
		longdesc?: string;
		marginheight?: string;
		marginwidth?: string;
		mozbrowser?: string;
		name?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		sandbox?: HTMLIframeSandbox;
		scrolling?: string;
		src?: string;
		srcdoc?: string;
		width?: number | string;
	}
	interface HTMLImgAttrs extends HTMLAttrs {
		align?: string;
		alt?: string;
		border?: string;
		crossorigin?: HTMLCrossorigin;
		decoding?: 'sync' | 'async' | 'auto';
		height?: number | string;
		hspace?: string;
		intrinsicsize?: string;
		ismap?: boolean;
		loading?: 'eager' | 'lazy';
		longdesc?: string;
		name?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		sizes?: number | string | (number | string)[];
		src?: string;
		srcset?: string;
		usemap?: string;
		vspace?: string;
		width?: number | string;
	}
	interface HTMLInputAttrs extends HTMLAttrs {
		accept?: number | string | (number | string)[];
		alt?: string;
		autocomplete?: HTMLAutocomplete;
		autocorrect?: string;
		capture?: string;
		checked?: boolean;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		formaction?: string;
		formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
		formmethod?: HTMLFormMethod;
		formnovalidate?: boolean;
		formtarget?: string;
		height?: number | string;
		incremental?: string;
		list?: string;
		max?: number | string;
		maxlength?: number | string;
		min?: number | string;
		minlength?: number | string;
		mozactionhint?: string;
		multiple?: boolean;
		name?: string;
		orient?: string;
		pattern?: string;
		placeholder?: string;
		readonly?: boolean;
		required?: boolean;
		results?: string;
		size?: number | string;
		src?: string;
		step?: number | string;
		type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' | (string & {});
		value?: number | string;
		webkitdirectory?: string;
		width?: number | string;
	}
	interface HTMLInsAttrs extends HTMLAttrs {
		cite?: string;
		datetime?: string;
	}
	interface HTMLLabelAttrs extends HTMLAttrs {
		for?: string;
		form?: string;
	}
	interface HTMLLiAttrs extends HTMLAttrs {
		type?: string;
		value?: number | string;
	}
	interface HTMLLinkAttrs extends HTMLAttrs {
		as?: HTMLLinkAs;
		charset?: string;
		color?: string;
		crossorigin?: HTMLCrossorigin;
		disabled?: string;
		href?: string;
		hreflang?: string;
		imagesizes?: number | string | (number | string)[];
		imagesrcset?: string;
		integrity?: string;
		media?: number | string | (number | string)[];
		methods?: string;
		prefetch?: string;
		referrerpolicy?: HTMLReferrerPolicy;
		rel?: number | string | (number | string)[];
		rev?: string;
		sizes?: string;
		target?: string;
		type?: string;
	}
	interface HTMLMapAttrs extends HTMLAttrs {
		name?: string;
	}
	interface HTMLMetaAttrs extends HTMLAttrs {
		charset?: string;
		content?: string;
		'http-equiv'?: 'content-type' | 'default-style' | 'refresh' | 'x-ua-compatible' | 'content-security-policy';
		media?: number | string | (number | string)[];
		name?: string;
	}
	interface HTMLMeterAttrs extends HTMLAttrs {
		form?: string;
		high?: number | string;
		low?: number | string;
		max?: number | string;
		min?: number | string;
		optimum?: number | string;
		value?: number | string;
	}
	interface HTMLObjectAttrs extends HTMLAttrs {
		archive?: string;
		border?: string;
		classid?: string;
		codebase?: string;
		codetype?: string;
		data?: string;
		declare?: string;
		form?: string;
		height?: number | string;
		name?: string;
		standby?: string;
		type?: string;
		usemap?: string;
		width?: number | string;
	}
	interface HTMLOlAttrs extends HTMLAttrs {
		reversed?: boolean;
		start?: number | string;
		type?: string;
	}
	interface HTMLOptgroupAttrs extends HTMLAttrs {
		disabled?: boolean;
		label?: string;
	}
	interface HTMLOptionAttrs extends HTMLAttrs {
		disabled?: boolean;
		label?: string;
		selected?: boolean;
		value?: number | string;
	}
	interface HTMLOutputAttrs extends HTMLAttrs {
		for?: string;
		form?: string;
		name?: string;
	}
	interface HTMLPreAttrs extends HTMLAttrs {
		cols?: string;
		width?: string;
		wrap?: string;
	}
	interface HTMLProgressAttrs extends HTMLAttrs {
		max?: number | string;
		value?: number | string;
	}
	interface HTMLQAttrs extends HTMLAttrs {
		cite?: string;
	}
	interface HTMLScriptAttrs extends HTMLAttrs {
		async?: boolean;
		charset?: string;
		crossorigin?: HTMLCrossorigin;
		defer?: boolean;
		integrity?: string;
		language?: string;
		nomodule?: boolean;
		referrerpolicy?: HTMLReferrerPolicy;
		src?: string;
		type?: string;
	}
	interface HTMLSelectAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		disabled?: boolean;
		form?: string;
		multiple?: boolean;
		name?: string;
		required?: boolean;
		size?: number | string;
	}
	interface HTMLSlotAttrs extends HTMLAttrs {
		name?: string;
	}
	interface HTMLSourceAttrs extends HTMLAttrs {
		media?: number | string | (number | string)[];
		sizes?: number | string | (number | string)[];
		src?: string;
		srcset?: string;
		type?: string;
	}
	interface HTMLStyleAttrs extends HTMLAttrs {
		media?: string;
		scoped?: string;
		type?: string;
	}
	interface HTMLTableAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		border?: string;
		cellpadding?: string;
		cellspacing?: string;
		frame?: string;
		rules?: string;
		summary?: string;
		width?: string;
	}
	interface HTMLTbodyAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTdAttrs extends HTMLAttrs {
		abbr?: string;
		align?: string;
		axis?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		colspan?: string;
		headers?: number | string | (number | string)[];
		height?: string;
		rowspan?: string;
		scope?: string;
		valign?: string;
		width?: string;
	}
	interface HTMLTextareaAttrs extends HTMLAttrs {
		autocomplete?: HTMLAutocomplete;
		autocorrect?: string;
		cols?: number | string;
		dirname?: string;
		disabled?: boolean;
		form?: string;
		maxlength?: number | string;
		minlength?: number | string;
		name?: string;
		placeholder?: string;
		readonly?: boolean;
		required?: boolean;
		rows?: number | string;
		wrap?: 'soft' | 'hard';
	}
	interface HTMLTfootAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLThAttrs extends HTMLAttrs {
		abbr?: string;
		align?: string;
		axis?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		colspan?: string;
		headers?: number | string | (number | string)[];
		height?: string;
		rowspan?: string;
		scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto';
		valign?: string;
		width?: string;
	}
	interface HTMLTheadAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTimeAttrs extends HTMLAttrs {
		datetime?: string;
		default?: boolean;
		kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
		label?: string;
		src?: string;
		srclang?: string;
	}
	interface HTMLTrAttrs extends HTMLAttrs {
		align?: string;
		bgcolor?: string;
		char?: string;
		charoff?: string;
		valign?: string;
	}
	interface HTMLTrackAttrs extends HTMLAttrs {
		default?: string;
		kind?: string;
		label?: string;
		src?: string;
		srclang?: string;
	}
	interface HTMLUlAttrs extends HTMLAttrs {
		compact?: string;
		type?: string;
	}
	interface HTMLVideoAttrs extends HTMLAttrs {
		autopictureinpicture?: string;
		autoplay?: boolean;
		controls?: boolean;
		controlslist?: 'nodownload' | 'nofullscreen' | 'noremoteplayback';
		crossorigin?: HTMLCrossorigin;
		disablepictureinpicture?: string;
		disableremoteplayback?: string;
		height?: number | string;
		loop?: boolean;
		muted?: boolean;
		playsinline?: boolean;
		poster?: string;
		preload?: 'none' | 'metadata' | 'auto' | '';
		src?: string;
		width?: number | string;
	}
	type TypeMap = HTMLElementTagNameMap;
	interface AttrsMap {
		a: HTMLAAttrs;
		area: HTMLAreaAttrs;
		audio: HTMLAudioAttrs;
		base: HTMLBaseAttrs;
		bdo: HTMLBdoAttrs;
		blockquote: HTMLBlockquoteAttrs;
		body: HTMLBodyAttrs;
		br: HTMLBrAttrs;
		button: HTMLButtonAttrs;
		canvas: HTMLCanvasAttrs;
		caption: HTMLCaptionAttrs;
		col: HTMLColAttrs;
		colgroup: HTMLColgroupAttrs;
		data: HTMLDataAttrs;
		dd: HTMLDdAttrs;
		del: HTMLDelAttrs;
		details: HTMLDetailsAttrs;
		dialog: HTMLDialogAttrs;
		embed: HTMLEmbedAttrs;
		fieldset: HTMLFieldsetAttrs;
		form: HTMLFormAttrs;
		head: HTMLHeadAttrs;
		hr: HTMLHrAttrs;
		html: HTMLHtmlAttrs;
		iframe: HTMLIframeAttrs;
		img: HTMLImgAttrs;
		input: HTMLInputAttrs;
		ins: HTMLInsAttrs;
		label: HTMLLabelAttrs;
		li: HTMLLiAttrs;
		link: HTMLLinkAttrs;
		map: HTMLMapAttrs;
		meta: HTMLMetaAttrs;
		meter: HTMLMeterAttrs;
		object: HTMLObjectAttrs;
		ol: HTMLOlAttrs;
		optgroup: HTMLOptgroupAttrs;
		option: HTMLOptionAttrs;
		output: HTMLOutputAttrs;
		pre: HTMLPreAttrs;
		progress: HTMLProgressAttrs;
		q: HTMLQAttrs;
		script: HTMLScriptAttrs;
		select: HTMLSelectAttrs;
		slot: HTMLSlotAttrs;
		source: HTMLSourceAttrs;
		style: HTMLStyleAttrs;
		table: HTMLTableAttrs;
		tbody: HTMLTbodyAttrs;
		td: HTMLTdAttrs;
		textarea: HTMLTextareaAttrs;
		tfoot: HTMLTfootAttrs;
		th: HTMLThAttrs;
		thead: HTMLTheadAttrs;
		time: HTMLTimeAttrs;
		tr: HTMLTrAttrs;
		track: HTMLTrackAttrs;
		ul: HTMLUlAttrs;
		video: HTMLVideoAttrs;
		[unknown: string]: HTMLAttrs;
	}
	interface EventMap {
		body: HTMLBodyElementEventMap;
		audio: HTMLMediaElementEventMap;
		video: HTMLVideoElementEventMap;
		[unknown: string]: HTMLElementEventMap;
	}

	export {};
}

declare module '@neocomp/full/zro-router' {
	export interface Options {
		transitions: boolean;
		interceptClass: string;
		preserveClass: string;
		scrollToHash: false | ScrollIntoViewOptions;
		hashIsSeparateEntry: boolean;
		noHashScrollToTop: boolean;
		preserveTags: Set<string>;
		skipTags: Set<string>;
		fetcher: undefined | ((url: URL) => Promise<Response | Error>);
		stateProvider: (url: URL) => any;
		errorPage: (router: ZRORouter, url: URL, error: Error | Response) => void;
	}
	export class ZRORouter {
		#private;
		onAttach: Event<(router: this) => void>;
		onRoute: Event<(router: this, url: URL, set: (url: URL | false) => void) => void>;
		onBeforeFetch: Event<(router: this, url: URL, set: (url: URL) => void) => void>;
		onAfterFetch: Event<(router: this, url: URL, respone: Response) => void>;
		onBeforeUpdate: Event<(router: this, url: URL, page: Document) => void>;
		onAfterUpdate: Event<(router: this, url: URL) => void>;
		onError: Event<(router: this, url: URL, error: Error | Response) => void>;
		lastURL: URL;
		constructor(options?: Partial<Options>);
		go(url: URL | string): void;
		back(): void;
		forward(): void;
		attachToDom(): void;
	}
	class Event<Listener extends fn> {
		#private;
		on(listener: Listener): this;
		off(listener: Listener): this;
		trigger(...args: Parameters<Listener>): this;
		once(listener: Listener): this;
		awaitForIt(): Promise<Parameters<Listener>>;
	}
	type fn = (...args: any[]) => any;

	export {};
}

declare module '@neocomp/full/litedom' {
	export function liteToNative(lite: LiteNode, converters?: Record<string, (lite: LiteNode) => Node>): HTMLElement;
	export function nativeToLite(native: Element): LiteNode;
	export class LiteNode {
		tag: string;
		attrs: Map<string, string | number | boolean>;
		children: (string | LiteNode)[];
		parent: LiteNode | undefined;
		meta: Map<string, any>;
		constructor(tag: string, attrs?: Record<string, string | number | boolean>, children?: (string | LiteNode)[], meta?: Record<string, any>);
		get childIndex(): number | undefined;
		get nextSibling(): LiteNode | string | undefined;
		get prevSibling(): LiteNode | string | undefined;
		append(...children: (LiteNode | string)[]): this;
		prepend(...children: (LiteNode | string)[]): this;
		insertAt(ind: number, ...children: (LiteNode | string)[]): this;
		before(...newSiblings: (LiteNode | string)[]): this;
		after(...newSiblings: (LiteNode | string)[]): this;
		remove(): this;
		replaceWith(node: LiteNode | string): this;
		removeChild(ind: number): this;
		replaceChild(ind: number, child: LiteNode | string): this;
		removeChildren(): this;
	}

	export {};
}

declare module '@neocomp/full/litedom/parse' {
	export interface Options {
		rootTag: string;
		voidTags: Set<string>;
		selfCloseTags: Set<string>;
		keepWhiteSpaceTags: Set<string>;
		keepWhiteSpace: boolean;
		rawTextTags: Set<string>;
		tagStart: RegExp;
		tagRest: RegExp;
		lowerTag: boolean;
		attrStart: RegExp;
		attrRest: RegExp;
		attrUnquoted: RegExp;
		lowerAttr: boolean;
		onComment: (parent: LiteNode, text: string) => void;
		onCData: (parent: LiteNode, text: string) => void;
	}
	export const defaultOptions: Options;
	export function parse(source: string, opts: Partial<Options>): LiteNode;
	class LiteNode {
		tag: string;
		attrs: Map<string, string | number | boolean>;
		children: (string | LiteNode)[];
		parent: LiteNode | undefined;
		meta: Map<string, any>;
		constructor(tag: string, attrs?: Record<string, string | number | boolean>, children?: (string | LiteNode)[], meta?: Record<string, any>);
		get childIndex(): number | undefined;
		get nextSibling(): LiteNode | string | undefined;
		get prevSibling(): LiteNode | string | undefined;
		append(...children: (LiteNode | string)[]): this;
		prepend(...children: (LiteNode | string)[]): this;
		insertAt(ind: number, ...children: (LiteNode | string)[]): this;
		before(...newSiblings: (LiteNode | string)[]): this;
		after(...newSiblings: (LiteNode | string)[]): this;
		remove(): this;
		replaceWith(node: LiteNode | string): this;
		removeChild(ind: number): this;
		replaceChild(ind: number, child: LiteNode | string): this;
		removeChildren(): this;
	}

	export {};
}

declare module '@neocomp/full/comp-base' {
	export const tempGen: {
		toDom(comp: AnyComp, template: Template, converters?: Record<string, (lite: LiteNode) => Node>): HTMLElement;
		generateFromLite(root: LiteNode, plugins?:Plugin[], walkOptions?: Partial<WalkOptions>): {
			node: LiteNode;
			actions: Action[];
		};
		generateFromString(source: string, plugins?:Plugin[], walkOptions?: Partial<WalkOptions>): Record<string,FileContent>;
		generateFromDom(root: HTMLElement, plugins?:Plugin[], walkOptions?: Partial<WalkOptions>): Template;
	};
	export const walkFns: {
		getTarget(node:WalkNode): number | HTMLElement;
		attrsOf(node:WalkNode): Generator<[name: string, value: string]>;
		hasAttr(node:WalkNode, attr: string): boolean;
		getAttr(node:WalkNode, attr: string): string | undefined;
		setAttr(node:WalkNode, attr: string, value: string): void;
		removeAttr(node:WalkNode, attr: string): void;
		childrenOf(node:WalkNode): Generator<WalkNode>;
		removeChildren(node:WalkNode): void;
		getText(node:WalkNode): string | undefined;
		setText(node:WalkNode, text: string): void;
		toFun(options: WalkOptions, args: string[], source: string):WalkFn;
		decodeAttrArg(value: string, options: WalkOptions): string;
		SerializedFn: typeofSerializedFn;
	};
	export const onAdd: Event<(name: string, comp: ConstructorFor<PureComp>) => void>;
	export const onNew: Event<(comp: PureComp) => void>;
	export const onRemove: Event<(comp: PureComp) => void>;
	export const onRootAdd: Event<(comp: PureComp) => void>;
	export const onRootRemove: Event<(comp: PureComp) => void>;
	export const onConvertTemplate: Event<(comp: PureComp, template: Template, el: HTMLElement) => void>;
	export const onAddTemplate: Event<(name: string, template: Template) => void>;
	export type CompProvider = (name: string) => ConstructorFor<AnyComp>;
	function add(name: string, Class: ConstructorFor<AnyComp>): void;
	function has(name: string): boolean;
	function get(name: string): ConstructorFor<PureComp>;
	function addToIdMap(id: string, comp: AnyComp): void;
	function getById(id: string): PureComp;
	function removeFromIdMap(id: string): boolean;
	function addProvider(name: string, provider: CompProvider): void;
	function setRoot(comp: AnyComp): void;
	function removeRoot(): void;
	export const registry: {
		root: PureComp | undefined;
		add: typeof add;
		has: typeof has;
		get: typeof get;
		addProvider: typeof addProvider;
		addToIdMap: typeof addToIdMap;
		getById: typeof getById;
		removeFromIdMap: typeof removeFromIdMap;
		setRoot: typeof setRoot;
		removeRoot: typeof removeRoot;
	};
	export type Status = 'preInit' | 'coreInit' | 'domInit' | 'inited' | 'removing' | 'removed';
	export type CompOptions = {
		initMode: 'minimal' | 'standared' | 'fullControl';
		anonymous: boolean;
		defaultId: (comp: PureComp) => string;
		removeChildren: boolean;
		store: Partial<StoreOptions>;
		view: Partial<ViewOptions>;
	};
	export const attachedComp: unique symbol;
	export class Component<TMap extends BaseMap> implements Linkable {
		#private;
		typemap: TMap;
		constructor(el?: HTMLElement, args?: Partial<TMap['args']>);
		id: string;
		name: string;
		status: Status;
		options: CompOptions;
		static defaults: CompOptions;
		initCore(): void;
		initDom(): void;
		fireInit(): void;
		onDomInit: OTIEvent<(comp: this) => void>;
		onInitInternal: OTIEvent<(comp: this) => void>;
		onInit: OTIEvent<(comp: this) => void>;
		init(): void;
		args(defaults: TMap['args']): TMap['args'];
		store: Store<TMap['props']>;
		get<P extends keyof TMap['props'] & string>(name: P | symbol): TMap["props"][P];
		set<P extends keyof TMap['props'] & string>(name: P | symbol, value: TMap['props'][P]): void;
		signal<P extends keyof TMap['props'] & string>(name: P | symbol, Default?: TMap['props'][P]): Signal<TMap["props"][P]>;
		effect(effectedBy: ((keyof TMap['props'] & string) | symbol)[], handler: () => void, effect?: ((keyof TMap['props'] & string) | symbol)[]): void;
		view: View<TMap['refs'], TMap['chunks']>;
		el: HTMLElement;
		refs: TMap['refs'];
		query<T extends HTMLElement = HTMLElement>(selector: string): T[];
		onLink: Event<(comp: this, linked: Linkable) => void>;
		onUnlink: Event<(comp: this, unlinked: Linkable) => void>;
		link(other: Linkable): void;
		unlink(other: Linkable): void;
		linkTo(other: Linkable): void;
		unlinkTo(other: Linkable): void;
		hasLink(other: Linkable): boolean;
		onChildAdded: Event<(comp: this, child: PureComp) => void>;
		onAddedToParent: Event<(comp: this, parent: PureComp) => void>;
		onUnlinkedFromParent: Event<(comp: this, parent: PureComp) => void>;
		onChildUnlink: Event<(comp: this, child: PureComp) => void>;
		parent?: PureComp;
		children: PureComp[];
		childmap: TMap['childmap'];
		addChild(child: AnyComp, ind?: number): void;
		linkParent(parent: AnyComp): void;
		unlinkParent(): void;
		unlinkChild(child: AnyComp): void;
		onRemove: Event<(comp: this) => void>;
		remove(): void;
	}
	export type PureComp = Pick<Component<BaseMap>, keyof Component<BaseMap>>;
	export type AnyComp = {
		[k in keyof Component<any>]: Component<any>[k] extends Event<fn> ? Event<fn> : Component<any>[k] extends OTIEvent<fn> ? OTIEvent<fn> : Component<any>[k];
	};
	export interface BaseMap {
		props: Record<string, any>;
		refs: Record<string, HTMLElement | HTMLElement[]>;
		childmap: Record<string, AnyComp>;
		args: Record<keyof any, any>;
		chunks: string;
	}
	export type getTypeMap<Comp extends AnyComp> = Comp['typemap'];
	export type getProps<Comp extends AnyComp> = getTypeMap<Comp>['props'];
	export type getRefs<Comp extends AnyComp> = getTypeMap<Comp>['refs'];
	export type getChildMap<Comp extends AnyComp> = getTypeMap<Comp>['childmap'];
	export type getArgs<Comp extends AnyComp> = getTypeMap<Comp>['args'];
	export type getChunks<Comp extends AnyComp> = getTypeMap<Comp>['chunks'];
	export class CompError extends Error {
		constructor(message: string);
	}
	export interface Linkable {
		onLink: Event<(self: any, other: Linkable) => void>;
		onUnlink: Event<(self: any, other: Linkable) => void>;
		link(other: Linkable): void;
		unlink(other: Linkable): void;
		hasLink(other: Linkable): boolean;
	}
	export function link(a: Linkable, b: Linkable): void;
	export function unlink(a: Linkable, b: Linkable): void;
	export class Resource<T> implements Linkable {
		#private;
		value: T;
		constructor(value: T);
		onLink: Event<(context: this, linked: Linkable) => void>;
		onUnlink: Event<(context: this, unlinked: Linkable) => void>;
		link(other: Linkable): void;
		unlink(other: Linkable): void;
		hasLink(other: Linkable): boolean;
		unlinkAll(): void;
	}
	export class Context<Props extends Record<string, any>> implements Linkable {
		#private;
		store: Store<Props>;
		constructor(props?: Partial<Props>, storeOptions?: Partial<StoreOptions>);
		get<P extends keyof Props & string>(name: P | symbol): Props[P];
		set<P extends keyof Props & string>(name: P | symbol, value: Props[P]): void;
		has(name: (keyof Props & string) | symbol): boolean;
		signal<P extends keyof Props & string>(name: P | symbol, value?: Props[P]): Signal<Props[P]>;
		effect(effectedBy: ((keyof Props & string) | symbol)[], handler: () => void, effect?: ((keyof Props & string) | symbol)[], from?: Linkable): void;
		onLink: Event<(context: this, linked: Linkable) => void>;
		onUnlink: Event<(context: this, unlinked: Linkable) => void>;
		link(other: Linkable): void;
		unlink(other: Linkable): void;
		hasLink(other: Linkable): boolean;
		unlinkAll(): void;
	}
	export class LazyComp {
		#private;
		el: HTMLElement | undefined;
		constructor(name: string, el?: HTMLElement, ...args: any[]);
		onInit: OTIEvent<(comp: PureComp) => void>;
	}
	export class Signal<T> {
		#private;
		constructor(store: Store<any>, prop: symbol);
		get value(): T;
		set value(value: T);
		get prop(): symbol;
		get store(): Store<any>;
		get asReadOnly(): ReadOnlySignal<T>;
		get asWriteOnly(): WriteOnlySignal<T>;
	}
	export class ReadOnlySignal<T> {
		#private;
		constructor(store: Store<any>, prop: symbol);
		get value(): T;
		get prop(): symbol;
		get store(): Store<any>;
	}
	export class WriteOnlySignal<T> {
		#private;
		constructor(store: Store<any>, prop: symbol);
		set value(value: T);
		get prop(): symbol;
		get store(): Store<any>;
	}
	export interface StoreOptions {
		static: boolean;
		addUndefined: boolean;
		baseProp: Prop<any>;
		updateOnDefine: boolean;
		updateOnSet: boolean;
		updateDispatcher: Partial<UDispatcherOptions>;
	}
	export interface Prop<T> {
		value: T;
		name: string;
		symbol: symbol;
		isStatic: boolean;
		meta: Record<keyof any, any>;
		init?: (this: this) => void;
		setter?: (this: this, value: T) => void;
		getter?: (this: this) => T;
		comparator: (old: T, New: T) => boolean;
	}
	export class Store<Props extends Record<string, any> = Record<string, any>> {
		#private;
		dispatcher: UpdateDispatcher;
		base: Linkable;
		constructor(base: Linkable, options?: Partial<StoreOptions>);
		options: StoreOptions;
		static defaults: StoreOptions;
		onAdd: Event<(store: this, prop: Prop<any>) => void>;
		onRemove: Event<(store: this, prop: Prop<any>) => void>;
		onChange: Event<(store: this, props: Prop<any>[]) => void>;
		add<P extends keyof Props & string>(name: P, propObj?: Partial<Omit<Prop<Props[P]>, 'name' | 'symbol'>>): Prop<Props[P]>;
		get<P extends keyof Props & string>(name: P | symbol): Props[P];
		getProp<P extends keyof Props & string>(name: P | symbol): Prop<Props[P]>;
		getSymbolFor(name: keyof Props & string): symbol;
		set<P extends keyof Props & string>(name: P | symbol, value: Props[P]): Prop<Props[P]>;
		setMultiple(props: Partial<Props>): void;
		has(name: keyof Props & string | symbol): boolean;
		remove(name: keyof Props & string | symbol): void;
		get bulkUpdating(): boolean;
		startBulkUpdate(): void;
		endBulkUpdate(): void;
		forceUpdate(name: keyof Props & string | symbol): void;
		updateAll(withStatic?: boolean): void;
		createSignal<P extends keyof Props & string>(name: P | symbol, Default?: Props[P]): Signal<Props[P]>;
		createROSignal<P extends keyof Props & string>(name: P | symbol, Default?: Props[P]): ReadOnlySignal<Props[P]>;
		createWOSignal<P extends keyof Props & string>(name: P | symbol, Default?: Props[P]): WriteOnlySignal<Props[P]>;
		addEffect(effectedBy: ((keyof Props & string) | symbol)[], handler: (this: EffectUnit) => void, effect?: ((keyof Props & string) | symbol)[], from?: Linkable, meta?: object): void;
		get asObject(): Props;
		get asMap(): Map<string, any>;
		[Symbol.iterator](): Generator<Prop<any>, void, unknown>;
		get propsToBeAdded(): string[];
	}
	export interface UDispatcherOptions {
		balance: boolean;
	}
	export interface EffectUnit {
		effect: symbol[];
		effectedBy: symbol[];
		handler: () => void;
		from: Linkable | undefined;
		meta: object;
	}
	export class UpdateDispatcher {
		#private;
		constructor(store: Store<any>, options?: Partial<UDispatcherOptions>);
		options: UDispatcherOptions;
		static defaults: UDispatcherOptions;
		add(effectedBy: symbol[], effect: symbol[], handler: (this: EffectUnit) => void, from?: Linkable, meta?: object): void;
		update(props: symbol[]): void;
		isDispatching: boolean;
		remove(fn: (unit: EffectUnit) => boolean, props?: symbol[]): void;
	}
	export function $proxy<Props extends Record<string, any>>(store: Store<Props>): Props;
	export function $in<From extends AnyComp, To extends AnyComp>(from: From, fromProp: (keyof getProps<From> & string) | symbol, to: To, toProp: (keyof getProps<To> & string) | symbol): void;
	export function $inout<A extends AnyComp, B extends AnyComp, T>(a: A, aProp: (keyof getProps<A> & string) | symbol, b: B, bProp: (keyof getProps<B> & string) | symbol, comparator?: (a: T, b: T) => boolean): void;
	export interface Action {
		type: string;
		target: number | HTMLElement;
		[unkown: string]: any;
	}
	type Handler_1 = (comp: PureComp, el: HTMLElement, action: Action, context: Record<string, any>) => void;
	export function addAction(name: string, handler: Handler_1): void;
	export function doActions(comp: AnyComp, actions: Action[], context: Record<string, any>): void;
	export function doActionsOfTemplate(comp: AnyComp, top: HTMLElement, liteTop: LiteNode, actions: Action[], context?: Record<string, any>): void;
	export interface ViewOptions {
		defaultEl: (comp: PureComp) => HTMLElement;
		template: Template;
		insertMode: InsertMode;
		into: string | undefined;
		effectHost: boolean;
		liteConverters: Record<string, (lite: LiteNode) => Node>;
		walkInPreContent: boolean;
		chunks: Record<string, Template>;
		removeEl: boolean;
	}
	export type InsertMode = 'asDefault' | 'replace' | 'atTop' | 'into' | 'atBottom' | 'none';
	export class View<Refs extends Record<string, HTMLElement | HTMLElement[]> = Record<string, HTMLElement>, Chunks extends string = string> {
		#private;
		comp: PureComp;
		el: HTMLElement;
		refs: Refs;
		constructor(comp: AnyComp, el?: HTMLElement, options?: Partial<ViewOptions>);
		options: ViewOptions;
		static defaults: ViewOptions;
		initDom(): void;
		query<T extends HTMLElement = HTMLElement>(selector: string): T[];
		constructChunk(name: Chunks | Template, context?: Record<string, any>): HTMLElement;
		getChunk(name: Chunks): Record<Chunks, Template>[Chunks];
		onWalk: Event<(view: this, el: HTMLElement, options: Partial<WalkOptions>) => void>;
		onAction: Event<(view: this, top: HTMLElement, action: Action[], context: Record<string, any>) => void>;
		walk(top: HTMLElement, options?: Partial<WalkOptions>): void;
		doActions(actions: Action[], top?: HTMLElement, context?: Record<string, any>, lite?: LiteNode): void;
		addRef<R extends keyof Refs>(name: R, el: Refs[R]): void;
		onCleanUp: Event<(view: this) => void>;
		cleanup(): void;
	}
	export interface Template {
		node: LiteNode;
		actions: Action[];
	}
	function add_1(name: string, template: Template): void;
	function get_1(name: string): Template;
	function has_1(name: string): boolean;
	export const templates: {
		add: typeof add_1;
		get: typeof get_1;
		has: typeof has_1;
	};
	export function toDom(comp: AnyComp, template: Template, converters?: Record<string, (lite: LiteNode) => Node>): HTMLElement;
	export interface Supplement {
		type: symbol;
	}
	export interface Plugin {
		onSource?: (source: string, options: Partial<Options>) => void;
		onDom?: (root: HTMLElement) => void;
		onRoot?: (root: LiteNode) => void;
		onTemplate?: (template: Template) => void;
		onSupplement?: (name: string, top: LiteNode) => undefined | Supplement;
	}
	export type FileContent = Template | Supplement;
	export function generateFromLite(root: LiteNode, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>): {
		node: LiteNode;
		actions: Action[];
	};
	export function generateFromString(source: string, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>): Record<string, FileContent>;
	export function generateFromDom(root: HTMLElement, plugins?: Plugin[], walkOptions?: Partial<WalkOptions>): Template;
	class LiteNode {
		tag: string;
		attrs: Map<string, string | number | boolean>;
		children: (string | LiteNode)[];
		parent: LiteNode | undefined;
		meta: Map<string, any>;
		constructor(tag: string, attrs?: Record<string, string | number | boolean>, children?: (string | LiteNode)[], meta?: Record<string, any>);
		get childIndex(): number | undefined;
		get nextSibling(): LiteNode | string | undefined;
		get prevSibling(): LiteNode | string | undefined;
		append(...children: (LiteNode | string)[]): this;
		prepend(...children: (LiteNode | string)[]): this;
		insertAt(ind: number, ...children: (LiteNode | string)[]): this;
		before(...newSiblings: (LiteNode | string)[]): this;
		after(...newSiblings: (LiteNode | string)[]): this;
		remove(): this;
		replaceWith(node: LiteNode | string): this;
		removeChild(ind: number): this;
		replaceChild(ind: number, child: LiteNode | string): this;
		removeChildren(): this;
	}
	export interface WalkOptions {
		serialize: boolean;
		inDom: boolean;
	}
	export function walk(node: WalkNode, options?: Partial<WalkOptions>): Action[];
	export interface TAttrExp {
		isExp: true;
		fn: WalkFn;
		dynamics: string[];
		statics: string[];
	}
	export interface TAttrProp {
		isExp: false;
		prop: string;
		static: boolean;
	}
	export type TAttrPart = string | TAttrProp | TAttrExp;
	export type TAttr = WalkFn | TAttrPart[];
	export function parseTAttr(source: string, attr: string, options: WalkOptions, globalArgs: string[]): TAttr;
	export function evalTAttr(attr: TAttr, comp: AnyComp, el: HTMLElement, context: Record<string, any>, props: any[]): any;
	export type WalkNode = HTMLElement | LiteNode;
	export type WalkFn = ((...args: any[]) => any) | SerializedFn;
	class SerializedFn {
		args: string[];
		source: string;
		constructor(args: string[], source: string);
	}
	type Handler = (node: WalkNode, attr: string, value: string, addAction: (act: Action, defer?: boolean) => void, options: WalkOptions) => void;
	export function addActionAttr(name: string, handler: Handler): void;
	class Event<Listener extends fn> {
		#private;
		on(listener: Listener): this;
		off(listener: Listener): this;
		trigger(...args: Parameters<Listener>): this;
		once(listener: Listener): this;
		awaitForIt(): Promise<Parameters<Listener>>;
	}
	class OTIEvent<Listener extends fn> {
		#private;
		on(listener: Listener): this;
		off(listener: Listener): this;
		trigger(...args: Parameters<Listener>): this;
		once(listener: Listener): this;
		awaitForIt(): Promise<Parameters<Listener>>;
	}
	type fn = (...args: any[]) => any;
	type ConstructorFor<T> = new (...args: any[]) => T;
	interface Options {
		rootTag: string;
		voidTags: Set<string>;
		selfCloseTags: Set<string>;
		keepWhiteSpaceTags: Set<string>;
		keepWhiteSpace: boolean;
		rawTextTags: Set<string>;
		tagStart: RegExp;
		tagRest: RegExp;
		lowerTag: boolean;
		attrStart: RegExp;
		attrRest: RegExp;
		attrUnquoted: RegExp;
		lowerAttr: boolean;
		onComment: (parent: LiteNode, text: string) => void;
		onCData: (parent: LiteNode, text: string) => void;
	}

	export {};
}

declare module '@neocomp/full/build' {
	import type { Plugin as VitePlugin } from 'vite';
	export interface Options {
		libPath: string;
		plugins: Plugin[];
		walk: Partial<WalkOptions>;
	}
	export interface GenData {
		imports: Record<string, Set<string>>;
		consts: Record<string, string>;
	}
	export function neoTempPlugin(options?: Partial<Options>): VitePlugin;
	interface Supplement {
		type: symbol;
	}
	interface Plugin {
		onSource?: (source: string, options: Partial<Options_1>) => void;
		onDom?: (root: HTMLElement) => void;
		onRoot?: (root: LiteNode) => void;
		onTemplate?: (template: Template) => void;
		onSupplement?: (name: string, top: LiteNode) => undefined | Supplement;
	}
	interface WalkOptions {
		serialize: boolean;
		inDom: boolean;
	}
	export type Serializer = (value: any, data: GenData, options: Options) => string;
	export function serialize(value: any, data: GenData, options: Options): string;
	export function addSerializer(type: ConstructorFor<any>, serializer: Serializer): void;
	interface Template {
		node: LiteNode;
		actions: Action[];
	}
	interface Options_1 {
		rootTag: string;
		voidTags: Set<string>;
		selfCloseTags: Set<string>;
		keepWhiteSpaceTags: Set<string>;
		keepWhiteSpace: boolean;
		rawTextTags: Set<string>;
		tagStart: RegExp;
		tagRest: RegExp;
		lowerTag: boolean;
		attrStart: RegExp;
		attrRest: RegExp;
		attrUnquoted: RegExp;
		lowerAttr: boolean;
		onComment: (parent: LiteNode, text: string) => void;
		onCData: (parent: LiteNode, text: string) => void;
	}
	interface Action {
		type: string;
		target: number | HTMLElement;
		[unkown: string]: any;
	}
	type ConstructorFor<T> = new (...args: any[]) => T;
	class LiteNode {
		tag: string;
		attrs: Map<string, string | number | boolean>;
		children: (string | LiteNode)[];
		parent: LiteNode | undefined;
		meta: Map<string, any>;
		constructor(tag: string, attrs?: Record<string, string | number | boolean>, children?: (string | LiteNode)[], meta?: Record<string, any>);
		get childIndex(): number | undefined;
		get nextSibling(): LiteNode | string | undefined;
		get prevSibling(): LiteNode | string | undefined;
		append(...children: (LiteNode | string)[]): this;
		prepend(...children: (LiteNode | string)[]): this;
		insertAt(ind: number, ...children: (LiteNode | string)[]): this;
		before(...newSiblings: (LiteNode | string)[]): this;
		after(...newSiblings: (LiteNode | string)[]): this;
		remove(): this;
		replaceWith(node: LiteNode | string): this;
		removeChild(ind: number): this;
		replaceChild(ind: number, child: LiteNode | string): this;
		removeChildren(): this;
	}

	export {};
}

//# sourceMappingURL=types.d.ts.map

declare module '*.neo.html' {
	import type { FileContent } from "comp-base";
	const contants: Record<string, FileContent>;
	export default contants;
}