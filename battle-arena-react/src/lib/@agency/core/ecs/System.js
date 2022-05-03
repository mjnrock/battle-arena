import Agent from "../Agent";
import Module from "./Module";

//TODO Figure out a place to do a System Dictionary
/**
 * This should eventually be either turned into a Singleton, or
 * instantiated on a global dictionary that would be get-ed and
 * used in a singleton/global-like capacity.
 */
export class System extends Agent {
	constructor(nomen, events = [], { state, Agent = {} } = {}) {
		super({ ...Agent, state });

		// System expects this to match a Module.nomen exactly
		this.nomen = nomen;

		this.toggle("isReducer", false);

		for(let [ trigger, handlers ] of events) {
			if(!Array.isArray(handlers)) {
				handlers = [ handlers ];
			}

			this.addTrigger(trigger, ...handlers);
		}

		return new Proxy(this, {
			get: (target, prop) => {
				if(typeof prop === "string" && prop[ 0 ] === "$") {
					return (...args) => target.invoke(prop.substring(1), ...args);
				}

				return Reflect.get(target, prop);
			},
		});
	}

	check(entity) {
		return !!entity[ this.nomen ];
	}
	get(entity) {
		return entity[ this.nomen ];
	}

	/**
	 * A convenience wrapper for Module.Add that already includes @this references,
	 * thus allowing System to act in a factory-like capacity, given an @entity
	 * and a @componentClass
	 */
	register(entity, componentClass, { args = [], tags = [], moduleClass } = {}) {
		if(Array.isArray(entity)) {
			for(let ent of entity) {
				(moduleClass || Module).Register(this.nomen, { entity: ent, componentClass, system: this, args, tags });
			}
		}

		return (moduleClass || Module).Register(this.nomen, { entity, componentClass, system: this, args, tags });
	}

	/**
	 * This is confusing AF, but it can act in a couple different ways:
	 * 	1) By passing an @entity alone, it will return the invocation
	 * 		convenience method ($) on the the mapped-Module to this.nomen
	 * 	2) If @entity is an array, it expects @trigger and optional @args
	 * 		which it will invoke on each passed entity via ($) using the
	 * 		same constaints as (1)
	 * 	3) If @entity is not an array, it works exactly as if you invoked
	 * 		the @trigger w/ @args directly on the entity's Module mapped
	 * 		to this.nomen
	 */
	$(entity, trigger, ...args) {
		// Invoke on each entity and save the result in a Map, mapped to the entity
		if(Array.isArray(entity)) {
			let ret = new Map();
			for(let ent of entity) {
				ret.set(entity, this.$(ent, trigger, ...args));
			}

			return ret;
		}

		// Invoke this.nomen-module on @entity directly
		if(trigger !== void 0) {
			return entity[ this.nomen ].$(trigger, ...args);
		}

		// Return a function that can later be passed (trigger, ...args)
		return entity[ this.nomen ].$;
	}
	async a$(entity, trigger, ...args) {
		return await this.$(entity, trigger, ...args);
	}

	
	//? Reminder
	// [
	// 	args,
	// 	{
	// 		namespace: this.config.namespace,
	// 		trigger: trigger,
	// 		target: this,
	// 		state: this.state,
	// 		invoke: this.invoke,
			
	// 		...this.config.globals,
	// 	}
	// ];
	// /**
	//  * Example handler
	//  */
	// onTrigger([ moduleInstance, ...args ], obj = {}) {

	// }
};

export default System;