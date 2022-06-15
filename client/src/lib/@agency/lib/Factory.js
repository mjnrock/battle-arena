import Identity from "./Identity";

import { singleOrArrayArgs } from "../util/helper";
import Registry from "./Registry";

/**
 * The Factory is a simple class to hold all the variables required to
 * instantiate a new object of a given type and with a pre-defined set of
 * properties, which can be optionally overriden.
 */
export class Factory extends Identity {
	static ParseObject(obj = {}) {
		const result = {};
		for(let [ key, entry ] of Object.entries(obj)) {
			if(Array.isArray(entry)) {
				const [ comp, ...args ] = entry;
				result[ key ] = new Factory(comp, args);
			} else {
				result[ key ] = new Factory(entry);
			}
		}

		return result;
	};

	constructor(species, args = [], { each, name, meta = {}, id, tags } = {}) {
		super({ id, tags });

		/**
		 * Optionally name the factory
		 */
		this.name = name;

		/**
		 * Optionally add meta data to the factory
		 */
		this.meta = meta;

		/**
		 * The Class that the Factory will instantiate
		 */
		this.species = species;

		/**
		 * The default arguments to pass to the Class when instantiating
		 */
		this.args = args;

		/**
		 * Optionally call a function on each instance after it has been created (i.e. effects)
		 */
		this.each = each;
	}

	/**
	 * Evaluate whether or not the given object is an instance of the species.
	 */
	is(input) {
		return input instanceof this.species;
	}

	copy(...args) {
		return new Factory(this.species, args, {
			name: this.name,
			meta: this.meta,
			each: this.each,
			id: this.id,
			tags: this.tags
		});
	}

	/**
	 * Create a new instance of the species, using default arguments if none are provided.
	 */
	create(...args) {
		let instance;
		if(args.length) {
			instance = new this.species(...args);
		} else {
			instance = new this.species(...this.args);
		}

		if(typeof this.each === "function") {
			this.each(instance);
		}

		return instance;
	}
	/**
	 * Create multiple instances of the species, ultimately through .create
	 */
	createMany(qty = 1, args = [], each) {		
		args = singleOrArrayArgs(args);

		const instances = [];		
		for(let i = 0; i < qty; i++) {
			/**
			 * Allow for a callback to be passed in to modify the arguments, so that
			 * the factory can create dynamic arguments for each iteration.
			 */
			let newArgs = typeof args === "function" ? args(i) : args;

			const instance = this.create(...newArgs);
			instances.push(instance);

			if(typeof each === "function") {
				each(i, instance, this);
			}
		}

		return instances;
	}
	createRegistryFactory(aliasClassMap = {}, aliasArgsMap = {}) {
		const registry = new Registry();
	
		Object.entries(aliasClassMap).forEach(([ key, clazz ]) => {
			const args = Array.isArray(aliasArgsMap[ key ]) ? aliasArgsMap[ key ] : [];
			const comp = new Factory(clazz, args, {
				name: key,
			});
	
			registry.registerWithAlias(comp, key);
		});
	
		return registry;
	}


	static Generate(species, ...args) {
		return new species(...args);
	}
	static GenerateMany(species, qty = 1, args = [], each) {
		args = singleOrArrayArgs(args);

		const instances = [];
		for(let i = 0; i < qty; i++) {
			/**
			 * Allow for a callback to be passed in to modify the arguments, so that
			 * the factory can create dynamic arguments for each iteration.
			 */
			let newArgs = typeof args === "function" ? args(i) : args;

			const instance = this.Generate(species, ...newArgs);
			instances.push(instance);

			/**
			 * Optionally perform work on the instance after it has been created.
			 */
			if(typeof each === "function") {
				each(i, instance);
			}
		}

		return instances;
	}
};

export default Factory;