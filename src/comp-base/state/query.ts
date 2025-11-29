import { ReadOnlySignal, WriteOnlySignal, type Signal } from "./signal.ts";
import type { Store } from "./store.ts";

/** reactive result of a promise */
export interface Query<T, E> {
	status: 'loading' | 'success' | 'error',
	value?: T,
	error?: E
}

/** create a signal from a promise */
export function query <T, E> (store: Store, promise: Promise<T>) {
	const query: Query<T, E> = { status: 'loading' };
	const signal = store.signal(query);

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
	);
	
	return signal.asReadOnly;
}

/** async computed property result */
export interface ComputedQuery <T, E> {
	status: 'success' | 'error',
	isLoading: boolean,
	firstTime: boolean,
	value?: T,
	error?: E
}

/** create an async computed property */
export function computedQuery <T, E> (store: Store, fn: () => Promise<T>)
	: ReadOnlySignal<ComputedQuery<T, E>>;
export function computedQuery <T, E> (
	store: Store, effectedBy: (number | Signal<any>)[], fn: () => Promise<T>
): ReadOnlySignal<ComputedQuery<T, E>>
export function computedQuery <T, E> (
	store: Store, effectedBy: (number | Signal<any>)[] | (() => Promise<T>), fn?: () => Promise<T>
) {
	const query: ComputedQuery<T, E> = { status: 'success', isLoading: true, firstTime: true };
	const signal = store.signal(query);
	let firstTime = true, runningQueries = 0;

	const effect = async () => {
		store.trackHint(signal.id, 'effected');

		query.isLoading = true;
		runningQueries++;
		query.firstTime = firstTime;
		
		/** update signal after promise resolve */
		function callback (status: ComputedQuery<T, E>['status'], value?: T, error?: E) {
			Object.assign(query, { status, value, error });
			signal.update();
			runningQueries -= 1;
			if (runningQueries === 0) query.isLoading = false;
		}

		// establish callbacks
		(typeof(effectedBy) === 'function' ? effectedBy : fn!)().then(
			value => callback('success', value, undefined),
			error => callback('error', undefined, error),
		);

		firstTime = false;
	}

	// add effect
	if (typeof(effectedBy) === 'function') store.effect(effect);
	else store.effect(effectedBy, [signal], effect)

	return signal.asReadOnly
}
