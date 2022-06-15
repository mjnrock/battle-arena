import Identity from "../Identity";
import Registry from "./../Registry";
import Component from "./Component";
import Entity from "./Entity";
import System from "./System";

import Factory from "./../Factory";
import { singleOrArrayArgs } from "../../util/helper";

export class Environment extends Identity {
	/**
	 * This function only returns an Object (not a Registry), but replaces
	 * the leaf-level entries with the instantiated Factories.
	 */
	static ParseGeneratorObject(generators = {}) {
		const obj = {};
		
		obj.Components = Factory.ParseObject(generators.Components || {});
		obj.Systems = Factory.ParseObject(generators.Systems || {});

		if(generators.Entities) {
			const entities = {};
			for(let [ name, entry ] of Object.entries(generators.Entities)) {
				if(Array.isArray(entry)) {
					const comps = {};
					let [ ent, compData ] = entry;
					compData = singleOrArrayArgs(compData);
					
					for(let compArgs of compData) {
						compArgs = singleOrArrayArgs(compArgs);
						const [ name, ...args ] = compArgs;
						
						/**
						 * If you pass a Factory to the Entity, it will call .create() on it
						 * and use the result as the Component.
						 */
						comps[ name ] = obj.Components[ name ].copy(name, ...args);
					}
					
					entities[ name ] = new Factory(ent, [ comps ]);
				} else {
					entities[ name ] = new Factory(entry);
				}
			}

			obj.Entities = entities;
		}

		return obj;
	}

	constructor ({ instances = [], generators = {}, config = {}, id, tags } = {}) {
		super({ id, tags });

		/**
		 * Optionally allow for a custom config object
		 */
		this.config = {
			// Default config
		};
		this.mergeConfig(config);
		
		/**
		 * These are basically Factory-leaf, namespace-trees
		 */
		this.Generators = Environment.ParseGeneratorObject(generators);

		/**
		 * These ECS namespaces hold the actual instances
		 */
		//IDEA Any instances added should have a .deconstructor hook added to them to remove them from the Environment (may require Struct-like AgencyBase)
		this.Instances = {
			Systems: new Registry(instances, {
				encoder: Registry.Encoders.InstanceOf(System),
			}),
			Entities: new Registry(instances, {
				encoder: Registry.Encoders.InstanceOf(Entity),
				classifiers: [
					Registry.Classifiers.HasTag("cats"),
				],
			}),
			Components: new Registry(instances, {
				encoder: Registry.Encoders.InstanceOf(Component),
			}),
		};

	}

	//#region Convenience Getters
	/**
	 * Single-stroke are instances
	 */
	get E() {
		return this.Instances.Entities;
	}
	get C() {
		return this.Instances.Components;
	}
	get S() {
		return this.Instances.Systems;
	}

	/**
	 * Double-strokes are generators
	 * 
	 * NOTE: While this "introduces character ambiguity", these are only an aliases, so don't
	 * use them if you suck at details; they're overtly different to me, so *shrug*.
	 */
	get 𝔼() {		// G1 Macro
		return this.Generators.Entities;
	}
	get ℂ() {		// G2 Macro
		return this.Generators.Components;
	}
	get 𝕊() {		// G3 Macro
		return this.Generators.Systems;
	}
	//#endregion Convenience Getters

	dispatch(systemId, event, entities = [], ...args) {
		const system = this.Instances.Systems.get(systemId);

		if(!system) {
			return false;
		} else if(!system.events.has(event)) {
			return false;
		}

		entities = singleOrArrayArgs(entities);

		const handlers = system.events.get(event);
		for(let handler of handlers) {
			handler(entities, ...args);
		}

		return true;
	}
};

export default Environment;