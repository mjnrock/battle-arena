import Registry from "../../util/Registry";
import Entity from "./Entity";
import System from "./System";

export class Manager extends System {
	constructor (entities = [], handlers = {}, { id, tags } = {}) {
		super(handlers, { id, tags });

		this.entities = new Registry(entities, {
			encoder: Registry.Encoders.InstanceOf(Entity),
			classifiers: [
				Registry.Classifiers.InstanceOf(true),
				Registry.Classifiers.Tagging(),
			],
		});
	}

	trigger(type, data, opts = {}) {
		return super.trigger(this.entities.values, type, data, opts);
	}
};

export default Manager;