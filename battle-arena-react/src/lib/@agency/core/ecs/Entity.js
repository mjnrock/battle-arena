import Registry from "../Registry";
import { singleOrArrayArgs } from "./../../util/helper";

/**
 * An Entity is a Context where the .state has been formalized to hold Components
 * within a Registry.  As an Entity, reducers on the state only function as event
 * handlers, and no longer function as reducers.
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