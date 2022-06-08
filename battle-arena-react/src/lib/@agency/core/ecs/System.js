import Context from "../Context";
import Entity from "./Entity";
import { singleOrArrayArgs } from "../../util/helper";

/**
 * The System is basically a Component-reducer for Entities.  When dispatched, the System will
 * iterate over all Entities and call the handlers associated with that dispatch event.  Those
 * handlers are expected to perform *all* of the work required and assign the new Component state.
 */
export class System extends Context {
	constructor (entities = [], agentObj = {}) {
		super(entities, agentObj);
	}

	dispatch(event, entities = [], ...args) {
		if(typeof entities === "function") {
			entities = entities(event, ...args);
		}

		const next = this.trigger(event, [ singleOrArrayArgs(entities), ...args ]);

		return next;
	}

	/**
	 * Perform a dispatch on all entities in the registry
	 */
	dispatchAll(event, ...args) {
		const results = [];
		for(let entity of this.registry.iterator) {
			results.push(this.trigger(event, [ entity, ...args ]));
		}

		return results;
	}
	dispatchAt(eid, event, ...args) {
		if(eid instanceof Entity) {
			eid = eid.id;
		}

		const agent = this.registry.get(eid);

		if(agent) {
			return this.trigger(event, [ agent, ...args ]);
		}
	}
	dispatchSome(eid = [], event, ...args) {
		const results = [];

		if(typeof eid === "function") {
			for(let entity of this.registry.iterator) {
				if(eid(entity) === true) {
					results.push(this.trigger(event, [ entity, ...args ]));
				}
			}
		} else {
			eid = singleOrArrayArgs(eid).map(e => e instanceof Entity ? e.id : e);

			for(let entity of this.registry.iterator) {
				if(eid.includes(entity.id)) {
					results.push(this.trigger(event, [ entity, ...args ]));
				}
			}
		}

		return results;
	}
};

export default System;