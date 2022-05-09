import { v4 as uuid } from "uuid";
import Struct from "./Struct";

/**
 * The Component is essentially a meta-wrapper around a Component that allows for a more
 * useful paradigm, holding important references and having the ability to reseed whatever
 * component it controls.
 * 
 * When @entity is passed, the Component will invoke the @entity's .register function
 * In general, Entity will bypass Component and interact directly with the Component in .state,
 * acting transparently.
 */
export class Component {
	constructor(nomen, { entity, template, system, seed = [], tags = [] } = {}) {
		this.id = uuid();
		this.nomen = nomen;		// The unique name for a Component
		this.tags = new Set(tags);		// Any tags for filtering/selection
		
		this.defaultArgs = seed;	// Used as defaults when reseeding
		this.classes = {
			struct: template || Struct,		// Used to reseed
		};

		this.state = new this.classes.struct(...this.defaultArgs);	// State *is* the component
		this.system = system;	// Allow system ref to change, but have same nomen
		
		if(entity) {
			this.register(entity);
		}

		return new Proxy(this, {
			get: (target, prop) => {
				if(prop in target) {
					return Reflect.get(target, prop);
				}
				
				return Reflect.get(target.state, prop);
			},
			set: (target, prop, value) => {
				if(prop in target) {
					return Reflect.set(target, prop, value);
				}
				
				return Reflect.set(target.state, prop, value);
			},
		});
	}

	trigger(trigger, ...args) {
		return this.system.invoke(trigger, this, ...args);
	}

	reseed(...args) {
		if(args.length === 0) {
			this.state = new this.classes.struct(...this.defaultArgs);
		} else {
			this.state = new this.classes.struct(...args);
		}

		return this;
	}

	register(entity) {
		entity.register(this.nomen, this);
		this.entity = entity;

		return this;
	}
	unregister(entity) {		
		if(entity === this.entity) {
			entity.unregister(this.nomen);
			this.entity = null;
		}

		return this;
	}

	attach(system) {
		this.system = system;

		return this;
	}
	detach() {
		this.system = null;

		return this;
	}

	toObject(includeId = false) {
		return this.state.toObject(includeId);
	}
	toJson(includeId = false) {
		return this.state.toJson(includeId);
	}

	static Register(nomen, { entity, template, system, args = [], tags = [] } = {}) {
		const component = new this(nomen, { entity, template, system, args, tags });
		// component.register(entity);

		return component;
	}
	static Unregister(entity, nomen) {
		const component = entity[ nomen ];
		component.unregister(entity);

		return component;
	}

	static Factory(qty = 1, fnOrArgs = [], each) {
		// Single-parameter override for .Spawning one (1) this
		if(!Array.isArray(fnOrArgs)) {
			fnOrArgs = [ fnOrArgs ];
		}
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrArgs = qty;
			qty = 1;
		}

		let components = [];
		for(let i = 0; i < qty; i++) {
			let component = typeof fnOrArgs === "function" ? this.Create(...fnOrArgs(i, qty)) : this.Create(...fnOrArgs);

			components.push(component);

			if(typeof each === "function") {
				each(component);
			}
		}

		return components;
	}
	static Create(...args) {
		return new this(...args);
	}
};

export default Component;