import Identity from "../Identity";
import Runner from "../relay/Runner";

export class System extends Identity {
	constructor ({ handlers = {}, id, tags, name } = {}) {
		super({ id, tags });

		/**
		 * The name of the System and the name of the Component key it expects to find
		 */
		this.name = name;

		/**
		 * The System subscribes itself to the Runner, receiving the payload when .emitted to the .handler[ event ] Runner
		 */
		this.events = new Map();

		for(let [ key, handler ] of Object.entries(handlers)) {
			/**
			 * Add the event to the System, creating a new Runner to handle the event.
			 */
			this.add(key);

			if(typeof handler === "function") {
				/**
				 * If a function is also provided, make it the handler for the event for this System.
				 * This ensures, in these cases, that a handler is present for the given event.
				 */
				this[ key ] = handler;
			}
		}
	}

	/**
	 * Get the Component from the Entity
	 */
	get(entity) {
		if(entity.has(this.name)) {
			return entity.get(this.name);
		}

		return false;
	}
	/**
	 * Invoke Entity.update on the Entity, passing the new data
	 */
	set(entity, data) {
		entity.update(this.name, data);

		return entity;
	}

	/**
	 * Add a handler to the System
	 */
	add(key) {
		this.events.set(key, new Runner(key, this));

		return this;
	}
	/**
	 * Remove a handler from the System
	 */
	remove(key) {
		let runner = this.events.get(key);

		if(runner) {
			runner.removeAll();

			return this.events.delete(key);
		}

		return false;
	}
	/**
	 * Remove all handlers from the System
	 */
	clear() {
		for(let key of this.events.keys()) {
			this.remove(key);
		}

		this.events.clear();

		return this;
	}

	/**
	 * Emit an event to the System's Runner at the given event key
	 */
	emit(event, entities = [], ...args) {
		const runner = this.events[ event ];

		if(!runner) {
			return;
		}

		return runner.run(entities, ...args);
	}
};

export default System;