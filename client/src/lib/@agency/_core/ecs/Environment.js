import AgencyBase from "../AgencyBase";
import Registry from "../Registry";

export class Environment extends AgencyBase {
	constructor({ systems = [], entities = [], config = {}, id, tags } = {}) {
		super({ id, tags });
		/**
		 * A Registry for Systems
		 */
		this.systems = new Registry(systems);

		/**
		 * A Registry for Components
		 */
		this.entities = new Registry(entities);

		/**
		 * Configuration settings
		 */
		this.config = {
			...config,
		};
	}
};

export default Environment;