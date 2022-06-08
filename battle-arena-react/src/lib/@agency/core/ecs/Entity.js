import Registry from "../Registry";
import Context from "./../Context";

export class Entity extends Context {
	constructor(components = [], { agent = {} } = {}) {
		super([], agent);

		this.setState(new Registry(components));

		for(let component of components) {
			this.state.addAlias(component.id, component._name);
		}
	}
};

export default Entity;