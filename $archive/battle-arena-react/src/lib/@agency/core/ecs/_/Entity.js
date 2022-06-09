import Agent from "../Agent";
import Component from "./Component";

/**
 * this.nomen will return the Component's .state
 * this.comp`nomen` or this.comp(`nomen`) will both return the Component itself
 */
export class Entity extends Agent {
	static Nomen = null;
	static Dictionary = new Map();	// Seeded dynamically

	constructor(components = [], agent = {}) {
		super();
		
		this.components = new Map();
		if(typeof components === "function") {
			this.registerComponent(components());
		} else {
			this.registerComponent(components);
		}

		this.adapt(agent);

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

		this.components.clear();

		super.deconstructor();
		
		return this;
	}

	registerComponent(component) {
		if(component instanceof Component) {
			this.components.set(component.nomen, component);
		} else if(Array.isArray(component)) {
			for(let comp of component) {
				this.registerComponent(comp);
			}
		}

		return this;
	}
	unregisterComponent(component) {
		if(component instanceof Component) {
			this.components.delete(component.nomen);
		} else if(Array.isArray(component)) {
			for(let comp of component) {
				this.unregisterComponent(comp);
			}
		}

		return this;
	}

	/**
	 * While .register loads instantiated components, .attach will utilize << Component.Dictionary >>
	 * and dynamically instantiate the component and .register to << this >>.
	 */
	addComponent(nomen, seed, opts) {
		if(typeof nomen === "object") {
			for(let [ nom, args ] of Object.entries(nomen)) {
				if(Array.isArray(args)) {
					this.addComponent(nom, ...args);
				} else {
					this.addComponent(nom, args);
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
	removeComponent(nomen) {
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
	/**
	 * A tagged template convenience method for .getComponent
	 */
	get comp() {
		return this.getComponent;
	}
	
	find(input, { id = true, nomen = true, tags = true } = {}) {
		const results = new Set();

		if(Array.isArray(input)) {
			for(let inp of input) {
				const res = this.find(inp, { id, nomen, tags });
				
				if(res) {
					results.add(res);
				}
			}

			return results;
		}

		for(let component of this.components.values()) {
			if(input instanceof RegExp) {
				if(id && input.test(component.id)) {
					results.add(component);
				}

				if(nomen && input.test(component.nomen)) {
					results.add(component);
				}
				
				if(tags && input.test(component.tags.join(" "))) {
					results.add(component);
				}
			} else if(typeof input === "function") {
				if(input(component) === true) {
					results.add(component);
				}
			} else {
				if(id && component.id === input) {
					results.add(component);
				}

				if(nomen && component.nomen === input) {
					results.add(component);
				}

				if(tags && component.tags.has(input)) {
					results.add(component);
				}
			}
		}

		if(results.size) {
			return results;
		}

		return false;
	}
	findById(id) {
		return this.find(id, { id: true, nomen: false, tags: false });
	}
	findByNomen(nomen) {
		return this.find(nomen, { id: false, nomen: true, tags: false });
	}
	findByTags(...tags) {
		return this.find(tags, { id: false, nomen: false, tags: true });
	}

	triggerComponent(keyOrComp, trigger, ...args) {
		if(Array.isArray(trigger)) {
			let results = [];
			for(let [ trig, ...ags ] of trigger) {
				results.push(this.triggerComponent(keyOrComp, trig, ...ags));
			}

			return results;
		}
		
		let comp;
		if(keyOrComp instanceof Component) {
			//* Here to allow an Entity to give its version of the passed Component (e.g. for comparisons)
			comp = this.components.get(keyOrComp.nomen);
		} else {
			comp = this.components.get(keyOrComp);
		}

		return comp.trigger(trigger, ...args);
	}
	triggerComponents(keyOrComp, trigger, ...args) {
		const results = [];
		for(let comp of this.findAll(keyOrComp)) {
			results.push(comp.trigger(trigger, ...args));
		}

		return results;
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

export default Entity;