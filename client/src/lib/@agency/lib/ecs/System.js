import Identity from "../Identity";
import { singleOrArrayArgs } from "../../util/helper";

export class System extends Identity {
	constructor (events = [], { id, tags } = {}) {
		super({ id, tags });

		this.events = new Map();

		this.seed(events);
	}

	[ Symbol.iterator ]() {
		return this.events[ Symbol.iterator ]();
	}

	seed(events = []) {
		if(Array.isArray(events)) {
			//NOOP -- Array Map
		} else if(typeof events === "object") {
			events = Object.entries(events);	// Object Map
		}

		for(let [ event, handlerSet ] of events) {
			handlerSet = singleOrArrayArgs(handlerSet);
			if(!this.events.has(event)) {
				this.events.set(event, new Set());
			}

			const set = this.events.get(event);
			for(let handler of handlerSet) {
				set.add(handler);
			}

			this.events.set(event, set);
		}

		return this;
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