import Agent from "../Agent";
import Component from "./Component";

export class System extends Agent {
	static Instances = new Map();	
	static get $() {
		return this;
	}

	constructor(nomen, template, triggers = []) {
		super({
			triggers,
			config: {
				allowRPC: true,		//TODO Should pass invocations directly to methods, but verify it works
				allowMultipleHandlers: true,
				isReducer: false,
				generatePayload: false,
			},
		});

		this.nomen = nomen;		// System expects this to match a Component.nomen exactly
		this.template = template;	// The Component to be used as a template
	}

	check(entity) {
		return !!entity[ this.nomen ];	// True if entity has a Component-entry keyed to .nomen
	}
	get(entity) {
		return entity[ this.nomen ];	// Get the associated Component on @entity
	}


	/**
	 * A convenience wrapper for Component.Add that already includes @this references,
	 * thus allowing System to act in a factory-like capacity, given an @entity
	 * and a @componentClass
	 */
	register(entity, componentOrComponentClass, { args = [], tags = [], componentClass } = {}) {
		if(Array.isArray(entity)) {
			for(let ent of entity) {
				this.register(ent, componentOrComponentClass, { args, tags, componentClass });
			}

			return this;
		}

		if(componentOrComponentClass instanceof Component) {
			const component = componentOrComponentClass;
			component.nomen = this.nomen;
			component.system = this;

			return entity.register(component);
		}

		if(Array.isArray(entity)) {
			for(let ent of entity) {
				(componentClass || Component).Register(this.nomen, { entity: ent, componentClass: componentOrComponentClass, system: this, args, tags });
			}
		}

		return (componentClass || Component).Register(this.nomen, { entity, componentClass: componentOrComponentClass, system: this, args, tags });
	}
};

export default System;