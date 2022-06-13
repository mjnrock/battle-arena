import AgencyBase from "../../core/AgencyBase";
import Registry from "./../Registry";
import Component from "./Component";
import Entity from "./Entity";
import System from "./System";

export class Environment extends AgencyBase {
	constructor({ instances = [], generators = [], id, tags } = {}) {
		super({ id, tags });

		this.instances = new Registry(instances, {
			classifiers: [
				Registry.Classifiers.InstanceOf(System),
				Registry.Classifiers.InstanceOf(Entity),
				Registry.Classifiers.InstanceOf(Component),
			],
		});

		this.instances.addObject({
			Systems: new Registry(),
			Entities: new Registry(),
			Components: new Registry(),
		});

		this.generators = new Registry(generators);
	}

	// dispatch(systemId, event, entities = [], ...args) {

};

export default Environment;