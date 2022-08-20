import Identity from "../../util/Identity";
import Runner from "../../util/relay/Runner";

/**
 * The System reduces the state of the passed Entity/ies, typically performing work within
 * a specified component.  That being said, the entire Entity is provided to the System,
 * allowing it to modify anything and/or do anything it wants.
 */
export class System extends Identity {
	constructor ({ reducers = {}, id, tags, alias } = {}) {
		super({ id, tags });

		/**
		 * The name of the System and the name of the Component key it expects to find
		 */
		this.alias = alias || this.constructor.Alias;

		/**
		 * The System subscribes itself to the Runners, receiving the payload when .emitted to the .handler[ event ] Runner.
		 * Since this is a [ key, Runner(key) ] map, any additional listeners that may want to subscribe to System .emitted events
		 * can do so.
		 */
		this.events = new Map();

		/**
		 * Assign any handlers passed in to the System to their corresponding event keys.
		 * If @handler is not a function, this[ key ] = <fn> should exist already.  A value
		 * of << false >> will *remove* that event entirely (more relevant to inheritance).
		 */
		for(let [ key, reducer ] of Object.entries(reducers)) {
			if(key in [ "get", "set", "add", "remove", "clear", "bind", "dispatch" ]) {
				throw new Error(`Illegal event type: ${ key }.  Internal method uses this name.`);
			}

			/**
			 * Remove an existing event if << false >> is passed.
			 */
			if(reducer === false) {
				this.remove(key);
			} else {
				/**
				 * Add the event to the System, creating a new Runner to handle the event.
				 */
				this.add(key);
			}

			if(typeof reducer === "function") {
				/**
				 * If a function is also provided, make it the handler for the event for this System.
				 * This ensures, in these cases, that a handler is present for the given event.
				 */
				this[ key ] = reducer;
			}
		}

		/**
		 * This is equivalent to calling .add on all custom events
		 */
		this._addMethods();
	}

	/**
	 * Automatically .add any events that are present on the descendent System.
	 * This avoids having to manually .add each event to the System during instantiation.
	 */
	_addMethods() {
		for(let key of Reflect.ownKeys(this.constructor.prototype)) {
			if(key !== "constructor") {
				this.add(key)
			}
		}
	}

	/**
	 * Get the Component from the Entity
	 */
	get(entity) {
		if(entity.has(this.alias)) {
			return entity.get(this.alias);
		}

		return false;
	}
	/**
	 * Invoke Entity.update on the Entity, passing the new data
	 */
	set(entity, data) {
		entity.update(this.alias, data);

		return entity;
	}


	/**
	 * Add a handler to the System
	 */
	add(...keys) {
		/**
		 * By adding << this >>, we subscribe the System
		 * to the Runner, which will run this[ key ] when
		 * the event is emitted.  Modify that method to
		 * alter its behavior.
		 */
		for(let key of keys) {
			this.events.set(key, new Runner(key, this));
		}

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
	 * Assigns the this-bound @fn to the System under the @event key.
	 * This is primarily useful for adding handlers for which the System is responsible.
	 * 
	 * NOTE: If you don't want to bind @fn, use this.events.get(@event).add(@fn) to instead assign directly to the Runner.
	 */
	bind(event, fn) {
		if(!this.events.has(event)) {
			this.add(event);
		}

		this[ event ] = fn.bind(this);

		return this[ event ];
	}


	/**
	 * Emit an event to the System's Runner at the given event key
	 */
	dispatch(event, entities = [], ...args) {
		const runner = this.events.get(event);

		if(!runner) {
			return;
		}

		if(!Array.isArray(entities)) {
			entities = [ entities ];
		}

		return runner.run(entities, ...args);
	}

	/**
	 * A convenience method for running a fn against a collection of entities,
	 * passing each entity, along with the args, to the fn.
	 */
	static Each(entities, fn, ...args) {
		if(!Array.isArray(entities)) {
			entities = [ entities ];
		}
		
		const results = [];
		for(let entity of entities) {
			results.push(fn(entity, ...args));
		}
	
		return results;
	};
};

export default System;