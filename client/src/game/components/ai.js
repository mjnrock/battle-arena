/**
 * Any object-value that contains the function "process" will get invoked
 * when ai.process is called.  This is meant to act as a single point-of-entry
 * for all AI processing.
 */
export function ai({ wayfinder, process } = {}) {
	const state = {
		/**
		 * The wayfinding algorithms to use when finding a path
		 */
		//TODO: This should use the Wayfinder class
		wayfinder: wayfinder || {},

		/**
		 * A method for invoking the all child controllers .process() method
		 */
		process: process || function(...args) {
			for(let key of Object.keys(state)) {
				if(key !== "process") {
					let fn = state[ key ].process;
					if(typeof fn === "function") {
						fn(...args);
					}
				}
			}
		},
	};

	return state;
};

export default ai;