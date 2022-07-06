import Registry from "../Registry";
import Entity from "./Entity";
import System from "./System";

export class Manager extends System {
	constructor (entities = [], handlers = {}, { id, tags } = {}) {
		super(handlers, { id, tags });

		this.entities = new Registry(entities, {
			encoder: Registry.Encoders.InstanceOf(Entity),
		});
	}

	invoke(type, data, opts = {}) {
		return super.invoke(this.entities.values, type, data, opts);
	}
};

export default Manager;