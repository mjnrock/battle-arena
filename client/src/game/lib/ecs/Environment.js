import { Identity } from "../Identity";
import { Registry } from "../Registry";

export class Environment extends Identity {
	constructor ({ id, tags } = {}) {
		super({ id, tags });

		/**
		 * All Systems should be stored wherein each instance is stored by its name
		 * and is representative of a Singleton instance.
		 */
		this.systems = new Registry();

		/**
		 * This acts as an environment-level registry of all Entities within it.
		 */
		this.entities = new Registry();

		/**
		 * This should only contain functional generators for components.
		 */
		this.components = new Registry();

		/**
		 * This will create and register a new Entity within the Environment.
		 */
		this.spawner = new Registry();

		this.systems.addClassifier(() => (k, v, e) => v._environment = this);
		this.entities.addClassifier(() => (k, v, e) => v._environment = this);
	}

	traverse(target, path) {
		let paths = path.split(".");

		let target = this[ paths.shift() ];

		for(let path of paths) {
			target = target[ path ];
		}

		return target;
	}

	route(path, ...args) {
		const target = this.traverse(this.systems, path);

		if(target) {
			return target(...args);
		}
	}
	next(path, ...args) {
		const target = this.traverse(this.components, path);

		if(target) {
			return target(...args);
		}
	}

	/**
	 * Create and register a new Entity within the Environment.
	 */
	spawn(path, ...args) {
		const target = this.traverse(this.spawner, path);

		if(target) {
			const entity = new target(...args);
			this.entities.register(entity);
		}
	}
	/**
	 * STUB: This is far from complete, but skeletons the basic functionality
	 */
	despawn(entityOrId) {
		const entity = this.entities.get(entityOrId);

		if(entity) {
			this.entities.unregister(entity);

			entity.deconstructor();
		}
	}
};

export default Environment;