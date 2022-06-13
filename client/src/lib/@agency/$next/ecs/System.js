import AgencyBase from "../../core/AgencyBase";
import { singleOrArrayArgs } from "../../util/helper";

export class System extends AgencyBase {
	constructor (events = [], { id, tags } = {}) {
		super({ id, tags });

		this.events = new Map(events);
	}

	dispatch(event, entities = [], ...args) {
		if(!this.events.has(event)) {
			return false;
		}

		entities = singleOrArrayArgs(entities);

		const handlers = this.events.get(event);
		for(let handler of handlers) {
			handler(entities, ...args);
		}

		return true;
	}
};

export default System;