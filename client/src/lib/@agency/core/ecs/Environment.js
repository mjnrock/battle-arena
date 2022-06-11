import AgencyBase from "../AgencyBase";
import Registry from "../Registry";

export class Environment extends AgencyBase {
	constructor({ systems = [], entities = [], config = {}, id, tags } = {}) {
		super({ id, tags });
		/**
		 * A Registry for Systems
		 */
		this.Systems = new Registry(systems);

		/**
		 * A Registry for Components
		 */
		this.Entities = new Registry(entities);

		/**
		 * Configuration settings
		 */
		this.Config = {
			...config,
		};
	}
};

export default Environment;