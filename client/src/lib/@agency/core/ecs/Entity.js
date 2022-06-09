import Registry from "../Registry";
import { singleOrArrayArgs } from "./../../util/helper";

/**
 * An Entity is a Registry for Components (state), allowing for a centralized System (reducer) to
 * manage the state of the Entity viz-a-viz the Components.  The System is responsible for
 * assigning the new state of the Components, and as such, the Entity should be treated as a
 * read-only container object.
 */
export class Entity extends Registry {
	constructor(components = [], agencyBaseObj = {}) {
		super([], agencyBaseObj);

		components = singleOrArrayArgs(components);
		for(let component of components) {
			this.registerWithAlias(component, component.name);
		}
	}

	static Create(...args) {
		return new this(...args);
	}
	static Factory(qty = 1, fnOrArgs = [], each) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrArgs = qty;
			qty = 1;
		}

		if(!Array.isArray(fnOrArgs)) {
			fnOrArgs = [ fnOrArgs ];	// Make sure @fnOrArgs is an Array (primarily a convenience overload for Entity Factory, but is useful elsewhere)
		}

		let entities = [];
		for(let i = 0; i < qty; i++) {
			let args = fnOrArgs;
			if(typeof fnOrArgs === "function") {
				args = fnOrArgs(i);
			}

			const entity = this.Create(...args);
			entities.push(entity);

			if(typeof each === "function") {
				each(i, entity);
			}
		}

		return entities;
	}
};

export default Entity;