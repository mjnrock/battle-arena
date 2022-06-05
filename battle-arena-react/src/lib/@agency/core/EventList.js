import { spreadFirstElementOrArray } from "../util/helper";

export class EventList extends AgencyBase {
	constructor(events, aliases = [], agencyBaseObj = {}) {
		super(agencyBaseObj);

		/**
		 * Hold a pre-defined list of events and their handlers.
		 */
		this.events = new Map();

		/**
		 * Hold a pre-defined list of events and their alias.
		 */
		this.aliases = new Map();

		this.addEvent(events);
		this.addAlias(aliases);
	}

	//#region Event And Alias Manipulation
	addEvent(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.addEvent(event, handler);
			}
		} else {
			for(const handler of handlers) {
				if(!this.events.has(event)) {
					this.events.set(event, new Set());
				}
		
				this.events.get(event).add(handler);
			}
		}

		return this;
	}
	removeEvent(event, ...handlers) {
		handlers = spreadFirstElementOrArray(handlers);

		if(typeof event === "object") {
			const entries = Array.isArray(event) ? event : Object.entries(event);
			for(const [ event, handler ] of entries) {
				this.removeEvent(event, handler);
			}
		} else {
			for(const handler of handlers) {
				if(this.events.has(event)) {
					return this.events.get(event).delete(handler);
				}
			}
		}

		return this;
	}

	addAlias(event, aliases) {
		if(typeof event === "object") {
			this.addAliasObject(event);
		} else {
			for(const alias of aliases) {
				this.aliases.set(event, alias);
			}
		}

		return this;
	}
	addAliasObject(obj) {
		const entries = Array.isArray(obj) ? obj : Object.entries(obj);

		for(const [ event, ...aliases ] of entries) {
			this.addAlias(event, ...aliases);
		}

		return this;
	}
	removeAlias(...events) {
		for(const event of events) {
			if(!this.aliases.delete(event)) {
				return false;
			}
		}

		return true;
	}
	//#endregion Event And Alias Manipulation

	//#region Agent Attachment
	attach(agent) {
		for(const [ event, handlers ] of this.events) {
			for(const handler of handlers) {
				const alias = this.aliases.get(event) || event;

				agent.addEvent(alias, handler);
			}
		}

		return this;
	}
	detach(agent) {
		for(const [ event, handlers ] of this.events) {
			for(const handler of handlers) {
				const alias = this.aliases.get(event) || event;

				agent.removeEvent(alias, handler);
			}
		}

		return this;
	}
	//#endregion Agent Attachment
};

export default EventList;