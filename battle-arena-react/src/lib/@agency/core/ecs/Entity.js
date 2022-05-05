import Agent from "../Agent";
import Component from "./Component";

export class Entity extends Agent {
	constructor() {
		super({
			hooks: {
				get: [
					(target, prop) => {
						if(!(prop in target)) {
							/**
							 * NOTE: This is singularly used to access the Component.state (i.e. Component) directly,
							 * via a << Entity[ component.name ] >> syntax.  See note in Component.
							 */
							if(target.components.has(prop)) {
								return target.components.get(prop).state;
							}
		
						}
		
						return Reflect.get(target, prop);
					},
				],
				set: [
					(target, prop, value) => {
						if(value instanceof Component) {
							return target.register(prop, value);
						}
		
						return Reflect.set(target, prop, value);
					},
				],
			}
		});

		this.components = new Map();
	}

	register(key, value) {
		if(key instanceof Component) {
			this.components.set(key.nomen, key);
		} else if(value instanceof Component) {
			this.components.set(key, value);
		}

		return this;
	}
	unregister(input) {
		if(input instanceof Component) {
			return this.components.delete(input.nomen);
		}

		return this.components.delete(input);
	}

	find(...nameIdOrTags) {
		const ret = new Set();
		for(let input of nameIdOrTags) {
			if(this.components.has(input)) {
				// @input is a name
				ret.add(this.components.get(input));
			} else {
				for(let component of this.components.values()) {
					if(component.id === input) {
						// @input is an id
						ret.add(component);
					} else if(component.tags.has(input)) {
						// @input is a tag
						ret.add(component);
					}
				}
			}
		}

		return Array.from(ret);
	}
};

export default Entity;