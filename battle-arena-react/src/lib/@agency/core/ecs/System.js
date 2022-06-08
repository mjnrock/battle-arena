import Registry from "../Registry";
import Context from "../Context";
import { singleOrArrayArgs } from "../../util/helper";
import Entity from "./Entity";

export class System extends Context {
	constructor(entities = [], { agent = {} } = {}) {
		super(entities, agent);
	}

	dispatch(event, entities = [], ...args) {
		if(typeof entities === "function") {
			entities = entities(event, ...args);
		}

		entities = singleOrArrayArgs(entities);

		for(let entity of entities) {
			const next = this.trigger(event, [ entity, ...args ]);
		}

		return this;
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
			if(!Array.isArray(eid)) {
				eid = [ eid ];
			}

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