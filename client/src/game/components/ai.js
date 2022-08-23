import { Wayfinder } from "../lib/pathing/Wayfinder";

/**
 * Any object-value that contains the function "process" will get invoked
 * when ai.process is called.  This is meant to act as a single point-of-entry
 * for all AI processing.
 */
export function ai({ entity, wayfinder } = {}) {
	const state = {
		/**
		 * The entity that this AI commands
		 */
		ref: entity,

		/**
		 * The wayfinding algorithms to use when finding a path
		 */
		wayfinder: wayfinder || new Wayfinder(),
	};

	return state;
};

export default ai;