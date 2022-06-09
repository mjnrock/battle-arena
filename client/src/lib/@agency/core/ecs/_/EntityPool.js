import Context from "../Context";
import Entity from "./Entity";

/**
 * 
 */
export class EntityPool extends Context {
	constructor (entities = [], opts = {}) {
		super(entities, opts);
	}

	/**
	 * .trigger is the custom override for the .invoke method
	 * Use this prefernetially over .invoke
	 */
	trigger(trigger, ...args) {
		return this.map(entity => entity.trigger(trigger, ...args));
	}
	triggerComponent(nomen, trigger, ...args) {
		return this.map(entity => entity.triggerComponent(nomen, trigger, ...args));
	}
}

export default EntityPool;