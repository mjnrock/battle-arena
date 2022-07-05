import Relay from "@lespantsfancy/relay";
import Registry from "../Registry";

export class Entity extends Registry {
	constructor(components = {}, { id, tags } = {}) {
		super({ id, tags });

		this.register(components);

		this.events = new Relay.Service({
			test: (...args) => console.log(...args),
		});
	}
};

export default Entity;