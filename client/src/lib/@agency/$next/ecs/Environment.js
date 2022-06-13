import AgencyBase from "../../core/AgencyBase";
import Registry from "./../Registry";
import Component from "./Component";
import Entity from "./Entity";
import System from "./System";

export class Environment extends AgencyBase {
	constructor ({ instances = [], generators = [], config = {}, id, tags } = {}) {
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

		this.generators = new Registry(generators, {
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