import { singleOrArrayArgs } from "../util/helper";
import Entity from "./Component";

export class Events extends Entity {
	constructor (eventObj, { id, tags } = {}) {
		super({ id, tags });

		this.handlers = new Map();

		this.addHandlers(eventObj);
	}

	addHandler(event, handler) {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set());
		}

		const handlers = singleOrArrayArgs(handler);
		for(let fn of handlers) {
			if(typeof fn === "function") {
				this.handlers.get(event).add(fn);
			}
		}

		return this;
	}
	addHandlers(eventObj = {}) {
		for (let [ event, handler ] of Object.entries(eventObj)) {
			this.addHandler(event, handler);
		}

		return this;
	}

	removeHandler(event, handler) {
		if (!this.handlers.has(event)) {
			return false;
		}

		const set = this.handlers.get(event);

		return this;
	}
	removeEvent(...events) {
		const results = [];
		for(let event of events) {
			results.push(this.handlers.delete(event));
		}

		return this;
	}

	dispatch(event, entities = [], ...args) {
		const results = [];
		if (this.handlers.has(event)) {
			const handlers = this.handlers.get(event);
			for(let handler of handlers) {
				results.push(handler(entities, ...args));
			}
		}

		return results;
	}
}

export default Events;