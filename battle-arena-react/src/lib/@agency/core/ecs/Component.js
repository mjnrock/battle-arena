import { v4 as uuid } from "uuid";

/**
 * In the current paradigm, a Component basically just has to be a Struct
 * in which values can be primitives or classes, thus allowing delegation
 * of processing scope, when appropriate.  Since this is essentially a
 * Record class, internal variables are prefixed as such: this.__internalVar (cf. __id)
 * 
 * TODO In an ideal implementation, a Component has a 1:1 relationship with a DanfoJS DataFrome and is event-mediated through an Agent
 */
export class Component {
	constructor({ id } = {}) {
		this.__id = id || uuid();
	}

	/**
	 * NOTE: This is a convenience abstraction ($ and this.__module) such that when using
	 * the Entity Component short-hand, that an invocation can be made from the returned
	 * Component object without having to then once again search through the Entity.modules
	 * to invoke something.  Since a Component is intended to be (though not required) instantiated
	 * through a Module, in normal use cases this.__module will always have a value.
	 * 
	 * ? Syntax Example:
	 * const comp = entity[ name ];
	 * comp.$("started", Date.now());
	 * console.log(comp.key1);
	 * console.log(comp.key2);
	 * comp.$("finished", Date.now());
	 *  */
	$(trigger, ...args) {
		if(this.__module) {
			return this.__module.$(trigger, ...args);
		}

		return this;
	}
};

export default Component;