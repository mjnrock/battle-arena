import AgencyBase from "./../AgencyBase";
import Registry from "./../Registry";
import Component from "./Component";
import Entity from "./Entity";
import System from "./System";

import Factory from "./../Factory";

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
			const entities = {};
			for(let [ key, entry ] of Object.entries(generators.Entities)) {
				const comps = {};
				if(Array.isArray(entry)) {
					const [ ent, [ ...compEntries ] ] = entry;
					for(let compEntry of Object.values(compEntries)) {
						if(Array.isArray(compEntry)) {
							const [ name, ...args ] = compEntry;
							const factory = obj.Components[ name ];

							comps[ name ] = factory;
							
						} else {
							const factory = obj.Components[ compEntry ];

							comps[ compEntry ] = factory;
						}
					}
				} else {
					comps[ key ] = new Factory(entry);
				}

				/**
				 * Entity will call .create() on Factories when passed as Components
				 */
				entities[ key ] = new Factory(Entity, [ comps ]);
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