import Context from "../Context";
import Component from "./Component";

/**
 * this.nomen will return the Component's .state
 * this.comp`nomen` or this.comp(`nomen`) will both return the Component itself
 */
export class $ContextEntity extends Context {
	static Nomen = null;
	static Dictionary = new Map();	// Seeded dynamically

	constructor(components = [], entities = [], agent = {}) {
		super();
		
		this.components = new Map();
		if(typeof components === "function") {
			this.registerComponent(components());
		} else {
			this.registerComponent(components);
		}

		this.adapt(agent);
		this.registerComponent(entities);

		this.hook({
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
			pre: [
				(target, prop, value) => {
					if(value instanceof Component) {
						return target.register(prop, value);
					}
	
					return Reflect.set(target, prop, value);
				},
			],
		});
	}

	deconstructor() {
		for(let [ nomen, comp ] of this.components.entries()) {
			comp.deconstructor();
		}
	}

	registerComponent(key, value) {
		if(value instanceof Component) {
			this.components.set(key, value);
		} else if(key instanceof Component) {
			this.components.set(key.nomen, key);
		} else if(Array.isArray(key)) {		// [ [nomen, Component], Component, ... ]
			for(let entry of key) {
				if(entry instanceof Component) {
					this.registerComponent(entry);
				} else {
					this.registerComponent(...entry);
				}
			}
		} else if(!Array.isArray(key) && typeof key === "object") {
			const obj = key;

			for(let [ nomen, args ] of Object.entries(obj)) {
				if(!Array.isArray(args)) {
					args = [ args ];
				}
	
				const comp = Component.Seed(nomen, ...args);
				this.registerComponent(comp);
			}
		} else if(typeof key === "function") {
			this.registerComponent(...key(value));
		} else if(key instanceof Map) {
			this.components = key;
		}

		return this;
	}
	
	unregisterComponent(input) {
		if(input instanceof Component) {
			return this.components.delete(input.nomen);
		} else if(Array.isArray(input)) {
			for(let inp of input) {
				this.unregisterComponent(inp);
			}
		}

		return this.components.delete(input);
	}

	/**
	 * While .register loads instantiated components, .attach will utilize << Component.Dictionary >>
	 * and dynamically instantiate the component and .register to << this >>.
	 */
	attach(nomen, seed, opts) {
		if(typeof nomen === "object") {
			for(let [ nom, args ] of Object.entries(nomen)) {
				if(Array.isArray(args)) {
					this.attach(nom, ...args);
				} else {
					this.attach(nom, args);
				}
			}
		} else {
			this.registerComponent(Component.Seed(nomen, seed, opts));
		}


		return this;
	}
	/**
	 * Detach finds the registered component with .nomen = @nomen
	 */
	detach(nomen) {
		return this.unregisterComponent(this.components.get(nomen));
	}

	getComponent(keyOrComp) {
		if(keyOrComp instanceof Component) {
			return this.components.get(keyOrComp.nomen);
		} else if(Array.isArray(keyOrComp)) {		// Assume tagged template
			[ keyOrComp ] = keyOrComp;
		}

		return this.components.get(keyOrComp);
	}
	get comp() {
		return this.getComponent;
	}

	triggerComp(keyOrComp, trigger, ...args) {
		if(Array.isArray(trigger)) {
			let results = [];
			for(let [ trig, ...ags ] of trigger) {
				results.push(this.triggerComp(keyOrComp, trig, ...ags));
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
	get to() {
		return this.triggerComp;
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

	
	toObject(includeId = true) {
		const obj = super.toObject(includeId);

		obj.components = {};
		for(let comp of this.components.values()) {
			obj.components[ comp.nomen ] = comp.toObject(includeId);
		}

		return obj;
	}
	toJson(includeId = true) {
		return JSON.stringify(this.toObject(includeId));
	}

	static Seed(nomen, ...args) {
		const entityClass = this.Dictionary.get(nomen);

		return new entityClass(...args);
	}
	static SeedMap(...entityClasses) {
		if(Array.isArray(entityClasses[ 0 ])) {
			entityClasses = entityClasses[ 0 ];
		}
		
		for(let clazz of entityClasses.values()) {
			this.Dictionary.set(clazz.Nomen, clazz);
		}

		return this.Dictionary;
	}
};

export default $ContextEntity;