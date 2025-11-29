/** difference entry */
interface Diff<T> {
	type: 'add' | 'remove' | 'change',
	index: number,
	value: T
}

/** diff an array */
export function diff<T> (
	old: T[], New: T[], cb: (type: Diff<T>['type'] | 'none', ind: number, value: T, oldInd: number) => void
) {
	let newIsArr = Array.isArray(New), oldIsArr = Array.isArray(old);
	// case not array
	if (!newIsArr && !oldIsArr) return;
	// fast path when new is empty
	if (!newIsArr || New.length === 0)
		for (let ind = 0; ind < old.length; ind++) cb('remove', ind, old[ind], ind);
	// fast path when old is empty
	else if (!oldIsArr || old.length === 0)
		for (let ind = 0; ind < New.length; ind++) cb('add', ind, New[ind], 0);
	else {
		let oldInd = 0, newInd = 0, relInd = 0;
		mainLoop: while (oldInd < old.length && newInd < New.length) {
			let oldVal = old[oldInd], newVal = New[newInd];
			// case no change
			if (oldVal === newVal) {
				cb('none', relInd, newVal, oldInd);
				oldInd++, newInd++, relInd++;
				continue;
			}
			// case change, search upto 5 level deep
			for (let ind = 0; ind < 5; ind++) {
				if (oldInd + ind >= old.length || newInd + ind >= New.length) break;
				if (old[oldInd + ind] === New[newInd + ind]) {
					for (let i = 0; i < ind; i++)
						cb('change', relInd + i, New[newInd + i], oldInd + i);
					oldInd += ind, newInd += ind, relInd += ind;
					continue mainLoop;
				}
			}
			// case addition, search upto 5 level deep
			for (let ind = 0; ind < 5; ind++) {
				if (newInd + ind >= New.length) break;
				if (oldVal === New[newInd + ind]) {
					for (let i = 0; i < ind; i++)
						cb('add', relInd + i, New[newInd + i], oldInd);
					newInd += ind, relInd += ind;
					continue mainLoop;
				}
			}
			// case removal, search upto 5 level deep
			for (let ind = 0; ind < 5; ind++) {
				if (oldInd + ind >= old.length) break;
				if (newVal === old[oldInd + ind]) {
					for (let i = 0; i < ind; i++)
						cb('remove', relInd, old[oldInd + i], oldInd + i);
					oldInd += ind;
					continue mainLoop;
				}
			}
			// rare case, complix change, assume 1 change and continue
			cb('change', relInd, New[newInd], oldInd);
			oldInd += 1, newInd += 1, relInd += 1;
		}
		// case removed elements at the end
		if (oldInd < old.length)
			for (let ind = 0; oldInd + ind < old.length; ind++)
				cb('remove', relInd + ind, old[oldInd + ind], oldInd + ind);
		// case added elements at the end
		if (newInd < New.length)
			for (let ind = 0; newInd + ind < New.length; ind++)
				cb('add', relInd + ind, New[newInd + ind], oldInd);
	}
}