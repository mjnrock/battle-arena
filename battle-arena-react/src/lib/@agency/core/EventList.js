import { singleOrArrayArgs, spreadFirstElementOrArray } from "../util/helper";

export class EventList extends AgencyBase {
	constructor() {
		super();

		this.events = new Map();
		this.aliases = new Map();
	}

	addHandler(event, handler) {
		if(!this.events.has(event)) {
			this.events.set(event, new Set());
		}

		this.events.get(event).add(handler);

		return this;
	}
	addHandlers(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.addHandler(event, handler);
			}
		} else {
			for(const handler of handlers) {
				this.addHandler(event, handler);
			}
		}

		return this;
	}
	removeHandler(event, handler) {
		if(this.events.has(event)) {
			return this.events.get(event).delete(handler);
		}

		return false;
	}
	removeHandlers(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.removeHandler(event, handler);
			}
		} else {
			for(const handler of handlers) {
				this.removeHandler(event, handler);
			}
		}

		return this;
	}
};

export default EventList;