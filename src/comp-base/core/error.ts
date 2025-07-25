export class CompError extends Error {
	constructor (message: string) {
		const semiColonInd = message.replaceAll('\\:', '  ').indexOf(':');
		super(message.slice(semiColonInd + 1).trim());
		const type = message.slice(0, semiColonInd);
		this.name = type ? `neocomp (${type})` : 'neocomp';
	}
}

type ErrorLevel = 'ignore' | 'warn' | 'error' | 'debug';
export type ErrorCodes = 
	//general functionality
	101 | 102 | 103 | 104 | 105 | 106 | 107 | 108 | 109 | 110 | 111 | 112 | 113 | 114 | 115 | 116 | 117 |
	//state
	201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 209 |
	//view
	301 | 302 | 303 | 304 | 305 | 306 | 307 |
	//template
	401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413;

export const errorsLevels: { base: ErrorLevel } & Partial<Record<`err${ErrorCodes}`, ErrorLevel>> = {
	base: 'error'
}

export function raiseError (msg: string, errCode: ErrorCodes) {
	msg = msg + ';\n  errCode: ' + errCode;
	const level = errorsLevels[`err${errCode}`] || errorsLevels.base;
	if      (level === 'ignore') return;
	else if (level === 'warn') console.warn(msg);
	else if (level === 'error') throw new CompError(msg);
	else if (level === 'debug') {
		debugger;
		throw new CompError(msg);
	}
}