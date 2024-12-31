type EntryMap = { [key: string]: EntryMap | '' | string[]};
const entryMap: EntryMap = {
	'rawdom': {
		index: '',
		elements: ''
	},
	'zro-router': {
		index: ''
	},
	'litedom': {
		core: '',
		parse: ''
	},
	'comp-base': {
		core: '',
	}
}

//as straight path, without src/ or .ts
export const entries: string[] = [];

function flatternEntry (entry: EntryMap, path: string = '') {
	path = path === '' ? '' : path + '/';
	for (const name in entry) {
		const subEntry = entry[name];
		if (subEntry === '') entries.push(path + name);
		else if (Array.isArray(subEntry)) 
			subEntry.forEach(postfix => entries.push(path + name + '.' + postfix));
		else flatternEntry(subEntry, path + name);
	}
}
flatternEntry(entryMap);

//with src/ and .ts
export const entriesFull = entries.map(entry => `src/${entry}.ts`);
export const entriesFullSet = new Set(entriesFull); 