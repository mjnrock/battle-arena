import AgencyBase from "./../AgencyBase";
import Registry from "./../Registry";
import Component from "./Component";
import Entity from "./Entity";
import System from "./System";

import Factory from "./../Factory";
import { singleOrArrayArgs } from "../../util/helper";

export class Environment extends AgencyBase {
	static ParseGenerators(generators = {}) {
		const obj = {};
		if(generators.Components) {
			const components = {};
			for(let [ key, entry ] of Object.entries(generators.Components)) {
				if(Array.isArray(entry)) {
					const [ comp, ...args ] = entry;
					components[ key ] = new Factory(comp, args);
				} else {
					components[ key ] = new Factory(entry);
				}
			}

			obj.Components = components;
		}

		if(generators.Systems) {
			const systems = {};
			for(let [ key, entry ] of Object.entries(generators.Systems)) {
				if(Array.isArray(entry)) {
					const [ sys, ...args ] = entry;
					systems[ key ] = new Factory(sys, args);
				} else {
					systems[ key ] = new Factory(entry);
				}
			}

			obj.Systems = systems;
		}

		if(generators.Entities) {
			// const entities = {};
			// for(let [ key, entry ] of Object.entries(generators.Entities)) {
			// 	const comps = {};
			// 	if(Array.isArray(entry)) {
			// 		const [ ent, [ ...compEntries ] ] = entry;
			// 		for(let compEntry of Object.values(compEntries)) {
			// 			if(Array.isArray(compEntry)) {
			// 				const [ name, ...args ] = compEntry;
			// 				// const factory = obj.Components[ name ].copy(...args);
			// 				const comp = obj.Components[ name ].create(...args);
							
			// 				// comps[ name ] = factory;
			// 				comps[ name ] = comp;
			// 			} else {
			// 				// const factory = obj.Components[ compEntry ];
			// 				const comp = obj.Components[ compEntry ].create();
							
			// 				// comps[ compEntry ] = factory;
			// 				comps[ compEntry ] = comp;
			// 			}
			// 		}
					
			// 		/**
			// 		 * Entity will call .create() on Factories when passed as Components
			// 		 */
			// 		entities[ key ] = new Factory(ent, [ comps ], {
			// 			each(entity) {
			// 				// TODO
			// 			},
			// 		});
			// 	} else {
			// 		entities[ key ] = new Factory(entry);
			// 	}

			// 	console.log(key, entities[ key ])
			// }



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

		this.config = {
			// Default config
		};
		this.mergeConfig(config);

		this.instances = new Registry(instances, {
			classifiers: [
				Registry.Classifiers.InstanceOf(System),
				Registry.Classifiers.InstanceOf(Entity),
				Registry.Classifiers.InstanceOf(Component),
			],
		});
		this.instances.addWithAlias({
			Systems: new Registry(),
			Entities: new Registry(),
			Components: new Registry(),
		});

		this.generators = new Registry([], {
			classifiers: [
				// Registry.Classifiers.Is(System),
				// Registry.Classifiers.Is(Entity),
				// Registry.Classifiers.Is(Component),
			],
		});
		this.generators.addWithAlias({
			Systems: new Registry(),
			Entities: new Registry(),
			Components: new Registry(),
		});

		this.generators = Environment.ParseGenerators(generators);
	}

	//#region Convenience Getters
	/**
	 * Single-stroke are instances
	 */
	get E() {
		return this.instances.Entities;
	}
	get C() {
		return this.instances.Components;
	}
	get S() {
		return this.instances.Systems;
	}

	/**
	 * Double-strokes are generators
	 * 
	 * NOTE: While this "introduces character ambiguity", these are only an aliases, so don't
	 * use them if you suck at details; they're overtly different to me, so *shrug*.
	 */
	get 𝔼() {		// G1 Macro
		return this.generators.Entities;
	}
	get ℂ() {		// G2 Macro
		return this.generators.Components;
	}
	get 𝕊() {		// G3 Macro
		return this.generators.Systems;
	}
	//#endregion Convenience Getters

	dispatch(systemId, event, entities = [], ...args) {
		const system = this.instances.Systems.get(systemId);

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