import { WriteOnlySignal, type Signal } from "./signal.ts";
import type { EffectedProp, Store } from "./store.ts";

export interface Query<T, E> {
	status: 'loading' | 'success' | 'error',
	value?: T,
	error?: E
}

export function query <T, E> (signal: Signal<Query<T, E>>, promise: Promise<T>) {
	const query: Query<T, E> = { status: 'loading' };
	signal.value = query;
	promise.then(
		value => {
			query.status = 'success';
			query.value = value;
			signal.update();
		},
		error => {
			query.status = 'error';
			query.error = error;
			signal.update();
		}
	)
	return query;
}

export interface ComputedQuery <T, E> {
	status: 'success' | 'error',
	isLoading: boolean,
	firstTime: boolean,
	value?: T,
	error?: E
}

export function computedQuery <Props extends Record<string, any>, T, E> (
	store: Store<Props>, signal: Signal<Query<T, E>>, 
	effectedBy: EffectedProp<Props>[] | 'track', fn: () => Promise<T>
) {
	const query: ComputedQuery<T, E> = { status: 'success', isLoading: true, firstTime: true };
	signal.value = query;
	let firstTime = true, runningQueries = 0;

	const effect = async () => {
		query.isLoading = true;
		runningQueries++;
		query.firstTime = firstTime;
		
		function callback (status: ComputedQuery<T, E>['status'], value?: T, error?: E) {
			query.status = status;
			query.value = value;
			query.error = error;
			signal.update();
			runningQueries -= 1;
			if (runningQueries === 0) query.isLoading = false;
		} 

		fn().then(
			value => callback('success', value, undefined),
			error => callback('error', undefined, error),
		);

		firstTime = false;
	}

	if (effectedBy = 'track') store.addEffect('track', effect)
	else store.addEffect(effectedBy, effect)

	return query
}
