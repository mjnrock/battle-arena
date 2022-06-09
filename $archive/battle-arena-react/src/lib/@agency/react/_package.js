import useAgency from "./useAgency";
import { useEffect, useState } from "react";

export function useFlux({ state: i_state, reducers: i_reducers } = {}) {
	const [ state, setState ] = useState(i_state || {});
	const [ reducers, setReducers ] = useState(i_reducers || []);
	const dispatch = (type, ...args) => {
		let next;
		for(let reducer of reducers) {
			/**
			 * Note the general order of arguments, as they
			 * are *inconsistent* with the dispatch function
			 * and are instead ordered by usefulness to the
			 * reducer function
			 * 
			 * In general, the reducer follows the form:
			 * 		reducer(data, meta/opts);
			 */
			next = reducer(args, { type, state: next });
		}

		if(next !== void 0) {
			setState(next);
		}
	};

	useEffect(() => {
		if(Array.isArray(i_reducers)) {
			/**
			 * Each reducer should be a function that returns the next
			 * state
			 */
			setReducers(i_reducers);
		} else if(typeof i_reducers === "object") {
			/**
			 * If using an object, the key will be used as a type-check,
			 * and the value (which should be a fn) will be used as the
			 * reducer
			 */
			let newReducers = [];
			for(let [ key, fn ] of Object.entries(i_reducers)) {
				newReducers.push((args, { type, state }) => {
					if(key === type) {
						return fn(args, { type, state });
					}

					return state;
				});
			}

			setReducers(newReducers);
		}
	}, [ i_reducers ]);

	return {
		state,
		dispatch,
	};
};

export default {
	useFlux,
	useAgency,
};