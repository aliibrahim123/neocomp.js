export class CompError extends Error {
	constructor (message: string) {
		const semiColonInd = message.replaceAll('\\:', '  ').indexOf(':');
		super(message.slice(semiColonInd + 1).trim());
		const type = message.slice(0, semiColonInd);
		this.name = type ? `neocomp (${type})` : 'neocomp';
	}
}