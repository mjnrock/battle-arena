import Agent from "../Agent";
import Component from "./Component";

/**
 * this.nomen will return the Component's .state
 * this.comp`nomen` or this.comp(`nomen`) will both return the Component itself
 */
export class Entity extends Agent {
	constructor(components = []) {
		super({
			hooks: {
				get: [
					(target, prop) => {
						if(!(prop in target)) {
							/**
							 * NOTE: This is singularly used to access the Component.state (i.e. Struct) directly,
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
		this.register(components);
	}

	comp(keyOrComp) {
		if(keyOrComp instanceof Component) {
			return this.components.get(keyOrComp.nomen);
		} else if(Array.isArray(keyOrComp)) {		// Assume tagged template
			[ keyOrComp ] = keyOrComp;
		}

		return this.components.get(keyOrComp);
	}
	at(keyOrComp, trigger, ...args) {
		if(Array.isArray(trigger)) {
			let results = [];
			for(let [ trig, ...ags ] of trigger) {
				results.push(this.at(keyOrComp, trig, ...ags));
			}

			return results;
		}
		
		let comp;
		if(keyOrComp instanceof Component) {
			comp = this.components.get(keyOrComp.nomen);	// Pass a given Component and return that Entity's version of that Component, if it exists
		} else {		// Assume tagged template
			comp = this.components.get(keyOrComp);
		}

		return comp.trigger(trigger, ...args);
	}

	register(key, value) {		
		if(value instanceof Component) {
			this.components.set(key, value);
		} else if(key instanceof Component) {
			this.components.set(key.nomen, key);
		} else if(Array.isArray(key)) {		// [ [nomen, Component], Component, ... ]
			for(let entry of key) {
				if(entry instanceof Component) {
					this.register(entry);
				} else {
					this.register(...entry);
				}
			}
		} else if(key instanceof Map) {
			this.components = key;
		}

		return this;
	}
	
	unregister(input) {
		if(input instanceof Component) {
			return this.components.delete(input.nomen);
		} else if(Array.isArray(input)) {
			for(let inp of input) {
				this.unregister(inp);
			}
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