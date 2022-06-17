import { coerceToIterable } from "../util/helper";
import Component from "./Component";

export class Events extends Component {
	constructor ({ handlers, ...comp } = {}) {
		super({ handlers, ...comp });

		this.handlers = new Map();
		this.addHandlers(handlers);
	}

	addHandler(event, handler) {
		if (!this.handlers.has(event)) {
			this.handlers.set(event, new Set());
		}

		const handlers = coerceToIterable(handler);
		for(let fn of handlers) {
			if(typeof fn === "function") {
				this.handlers.get(event).add(fn);
			}
		}

		return this;
	}
	addHandlers(handlerObj = {}) {
		if(handlerObj instanceof Map) {
			handlerObj = Object.fromEntries(handlerObj);
		}

		for (let [ event, handler ] of Object.entries(handlerObj)) {
			this.addHandler(event, handler);
		}

		return this;
	}

	removeHandler(event, handler) {
		if (!this.handlers.has(event)) {
			return false;
		}

		const set = this.handlers.get(event);

		return set.delete(handler);
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