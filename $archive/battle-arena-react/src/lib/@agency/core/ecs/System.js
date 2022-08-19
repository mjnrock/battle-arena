import Agent from "../Agent";
import { singleOrArrayArgs } from "../../util/helper";

/**
 * The System is basically a Component-reducer for Entities.  When dispatched, the System will
 * iterate over all Entities and call the handlers associated with that dispatch event.  Those
 * handlers are expected to perform *all* of the work *and* assignment of the new Component state
 * to the Entity.
 * 
 * i.e. (...) => entities[ component.name ] = { ...newState }
 * 
 * NOTE that dispatch will *always* emit an array of Entities, event if there is only one (1).
 */
export class System extends Agent {
	constructor (agentObj = {}) {
		super(agentObj);
	}

	dispatch(event, entities = [], ...args) {
		if(typeof entities === "function") {
			entities = entities(event, ...args);
		}

		const next = this.emit(event, singleOrArrayArgs(entities), ...args);

		return next;
	}
};

export default System;