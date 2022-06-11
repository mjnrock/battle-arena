import AgencyBase from "./AgencyBase";

import { singleOrArrayArgs } from "../util/helper";

/**
 * The Factory is a simple class to hold all the variables required to
 * instantiate a new object of a given type and with a pre-defined set of
 * properties, which can be optionally overriden.
 */
export class Factory extends AgencyBase {
	constructor(species, args = [], { name, meta = {}, id, tags } = {}) {
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
	}

	/**
	 * Evaluate whether or not the given object is an instance of the species.
	 */
	is(input) {
		return input instanceof this.species;
	}

	/**
	 * Create a new instance of the species, using default arguments if none are provided.
	 */
	create(...args) {
		if(args.length) {
			return new this.species(...args);
		}

		return new this.species(...this.args);
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