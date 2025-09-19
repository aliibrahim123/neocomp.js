type EntryMap = { [key: string]: EntryMap | string | string[]};
const entryMap: EntryMap = {
	'rawdom': {
		index: 'rawdom',
		elements: ''
	},
	'zro-router': {
		index: 'zro-router'
	},
	'litedom': {
		core: 'litedom',
		parse: '',
		builder: ''
	},
	'comp-base': {
		core: 'comp-base',
		tempGen: ''
	},
	'build': {
		'plugin': 'build'
	}
}

//as straight path, without src/ or .ts
export const entries: string[] = [];
//as exported in package.json
export const exportedEntries: string[] = [];

function flatternEntry (entry: EntryMap, path: string = '') {
	path = path === '' ? '' : path + '/';
	for (const name in entry) {
		const subEntry = entry[name];
		if (typeof(subEntry) === 'string') {
			entries.push(path + name);
			exportedEntries.push(subEntry === '' ? path + name : subEntry);
		} else if (Array.isArray(subEntry)) 
			subEntry.forEach(postfix => {
				entries.push(path + name + '.' + postfix);
				exportedEntries.push(path + name + '.' + postfix);
			});
		else flatternEntry(subEntry, path + name);
	}
}
flatternEntry(entryMap);

//with src/ and .ts
export const fullEntries = entries.map(entry => `src/${entry}.ts`);