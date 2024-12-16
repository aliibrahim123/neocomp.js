//taken from https://github.com/stagas/html-jsx file index.d.ts version 1.0.0
//edited for small size
//removed comments
//removed svg
//removed deprectated elements 
//removed csstype dependency
//converted event attributes from EventHandler to string, use CreateObject.events

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
	onabort?:  string;
	onanimationend?:  string;
	onanimationiteration?:  string;
	onanimationstart?:  string;
	onblur?:  string;
	oncanplay?:  string;
	oncanplaythrough?:  string;
	onchange?:  string;
	onclick?:  string;
	oncompositionend?:  string;
	oncompositionstart?:  string;
	oncompositionupdate?:  string;
	oncontextmenu?:  string;
	oncopy?:  string;
	oncut?:  string;
	ondblclick?:  string;
	ondrag?:  string;
	ondragend?:  string;
	ondragenter?:  string;
	ondragexit?:  string;
	ondragleave?:  string;
	ondragover?:  string;
	ondragstart?:  string;
	ondrop?:  string;
	ondurationchange?:  string;
	onemptied?:  string;
	onencrypted?:  string;
	onended?:  string;
	onerror?:  string;
	onfocus?:  string;
	ongotpointercapture?:  string;
	oninput?:  string;
	onkeydown?:  string;
	onkeypress?:  string;
	onkeyup?:  string;
	onload?:  string;
	onloadeddata?:  string;
	onloadedmetadata?:  string;
	onloadstart?:  string;
	onlostpointercapture?:  string;
	onmousedown?:  string;
	onmouseenter?:  string;
	onmouseleave?:  string;
	onmousemove?:  string;
	onmouseout?:  string;
	onmouseover?:  string;
	onmouseup?:  string;
	onpaste?:  string;
	onpause?:  string;
	onplay?:  string;
	onplaying?:  string;
	onpointercancel?:  string;
	onpointerdown?:  string;
	onpointerenter?:  string;
	onpointerleave?:  string;
	onpointermove?:  string;
	onpointerout?:  string;
	onpointerover?:  string;
	onpointerup?:  string;
	onprogress?:  string;
	onratechange?:  string;
	onreset?:  string;
	onscroll?:  string;
	onseeked?:  string;
	onseeking?:  string;
	onselect?:  string;
	onstalled?:  string;
	onsubmit?:  string;
	onsuspend?:  string;
	ontimeupdate?:  string;
	ontouchcancel?:  string;
	ontouchend?:  string;
	ontouchmove?:  string;
	ontouchstart?:  string;
	ontransitionend?:  string;
	onvolumechange?:  string;
	onwaiting?:  string;
	onwheel?:  string;
}
declare type HTMLAutocapitalize = 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
declare type HTMLAutocomplete = 'additional-name' | 'address-level1' | 'address-level2' | 'address-level3' | 'address-level4' | 'address-line1' | 'address-line2' | 'address-line3' | 'bday' | 'bday-year' | 'bday-day' | 'bday-month' | 'billing' | 'cc-additional-name' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year' | 'cc-family-name' | 'cc-given-name' | 'cc-name' | 'cc-number' | 'cc-type' | 'country' | 'country-name' | 'current-password' | 'email' | 'family-name' | 'fax' | 'given-name' | 'home' | 'honorific-prefix' | 'honorific-suffix' | 'impp' | 'language' | 'mobile' | 'name' | 'new-password' | 'nickname' | 'organization' | 'organization-title' | 'pager' | 'photo' | 'postal-code' | 'sex' | 'shipping' | 'street-address' | 'tel-area-code' | 'tel' | 'tel-country-code' | 'tel-extension' | 'tel-local' | 'tel-local-prefix' | 'tel-local-suffix' | 'tel-national' | 'transaction-amount' | 'transaction-currency' | 'url' | 'username' | 'work';
declare type HTMLCrossorigin = 'anonymous' | 'use-credentials' | '';
declare type HTMLDir = 'ltr' | 'rtl' | 'auto';
declare type HTMLFormEncType = 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
declare type HTMLFormMethod = 'post' | 'get' | 'dialog';
declare type HTMLIframeSandbox = 'allow-downloads-without-user-activation' | 'allow-forms' | 'allow-modals' | 'allow-orientation-lock' | 'allow-pointer-lock' | 'allow-popups' | 'allow-popups-to-escape-sandbox' | 'allow-presentation' | 'allow-same-origin' | 'allow-scripts' | 'allow-storage-access-by-user-activation' | 'allow-top-navigation' | 'allow-top-navigation-by-user-activation';
declare type HTMLLinkAs = 'audio' | 'document' | 'embed' | 'fetch' | 'font' | 'image' | 'object' | 'script' | 'style' | 'track' | 'video' | 'worker';
declare type HTMLReferrerPolicy = 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
declare type HTMLRole = 'alert' | 'alertdialog' | 'application' | 'article' | 'banner' | 'blockquote' | 'button' | 'caption' | 'cell' | 'checkbox' | 'code' | 'columnheader' | 'combobox' | 'command' | 'complementary' | 'composite' | 'contentinfo' | 'definition' | 'deletion' | 'dialog' | 'directory' | 'document' | 'emphasis' | 'feed' | 'figure' | 'form' | 'generic' | 'grid' | 'gridcell' | 'group' | 'heading' | 'img' | 'input' | 'insertion' | 'landmark' | 'link' | 'list' | 'listbox' | 'listitem' | 'log' | 'main' | 'marquee' | 'math' | 'menu' | 'menubar' | 'menuitem' | 'menuitemcheckbox' | 'menuitemradio' | 'meter' | 'navigation' | 'none' | 'note' | 'option' | 'paragraph' | 'presentation' | 'progressbar' | 'radio' | 'radiogroup' | 'range' | 'region' | 'roletype' | 'row' | 'rowgroup' | 'rowheader' | 'scrollbar' | 'search' | 'searchbox' | 'section' | 'sectionhead' | 'select' | 'separator' | 'slider' | 'spinbutton' | 'status' | 'strong' | 'structure' | 'subscript' | 'superscript' | 'switch' | 'tab' | 'table' | 'tablist' | 'tabpanel' | 'term' | 'textbox' | 'time' | 'timer' | 'toolbar' | 'tooltip' | 'tree' | 'treegrid' | 'treeitem' | 'widget' | 'window';
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
	style?: | string | false | null;
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
	type?: 
		'button' | 'checkbox' | 'color' | 'date' | 'datetime-local' | 'email' | 'file' | 'hidden' 
		| 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' 
		| 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week' | (string & {});
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

export type TypeMap = HTMLElementTagNameMap; 
export interface AttrsMap {
	a         : HTMLAAttrs,
	area      : HTMLAreaAttrs,
	audio     : HTMLAudioAttrs,
	base      : HTMLBaseAttrs,
	bdo       : HTMLBdoAttrs,
	blockquote: HTMLBlockquoteAttrs,
	body      : HTMLBodyAttrs,
	br        : HTMLBrAttrs,
	button    : HTMLButtonAttrs,
	canvas    : HTMLCanvasAttrs,
	caption   : HTMLCaptionAttrs,
	col       : HTMLColAttrs,
	colgroup  : HTMLColgroupAttrs,
	data      : HTMLDataAttrs,
	dd        : HTMLDdAttrs,
	del       : HTMLDelAttrs,
	details   : HTMLDetailsAttrs,
	dialog    : HTMLDialogAttrs,
	embed     : HTMLEmbedAttrs,
	fieldset  : HTMLFieldsetAttrs,
	form      : HTMLFormAttrs,
	head      : HTMLHeadAttrs,
	hr        : HTMLHrAttrs,
	html      : HTMLHtmlAttrs,
	iframe    : HTMLIframeAttrs,
	img       : HTMLImgAttrs,
	input     : HTMLInputAttrs,
	ins       : HTMLInsAttrs,
	label     : HTMLLabelAttrs,
	li        : HTMLLiAttrs,
	link      : HTMLLinkAttrs,
	map       : HTMLMapAttrs,
	meta      : HTMLMetaAttrs,
	meter     : HTMLMeterAttrs,
	object    : HTMLObjectAttrs,
	ol        : HTMLOlAttrs,
	optgroup  : HTMLOptgroupAttrs,
	option    : HTMLOptionAttrs,
	output    : HTMLOutputAttrs,
	pre       : HTMLPreAttrs,
	progress  : HTMLProgressAttrs,
	q         : HTMLQAttrs,
	script    : HTMLScriptAttrs,
	select    : HTMLSelectAttrs,
	slot      : HTMLSlotAttrs,
	source    : HTMLSourceAttrs,
	style     : HTMLStyleAttrs,
	table     : HTMLTableAttrs,
	tbody     : HTMLTbodyAttrs,
	td        : HTMLTdAttrs,
	textarea  : HTMLTextareaAttrs,
	tfoot     : HTMLTfootAttrs,
	th        : HTMLThAttrs,
	thead     : HTMLTheadAttrs,
	time      : HTMLTimeAttrs,
	tr        : HTMLTrAttrs,
	track     : HTMLTrackAttrs,
	ul        : HTMLUlAttrs,
	video     : HTMLVideoAttrs,
	[unknown: string]: HTMLAttrs,
}
export interface EventMap {
	body: HTMLBodyElementEventMap,
	audio: HTMLMediaElementEventMap,
	video: HTMLVideoElementEventMap,
	[unknown: string]: HTMLElementEventMap
}