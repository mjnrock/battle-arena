import Registry from "../Registry";
import Context from "./../Context";

/**
 * An Entity is a Context where the .state has been formalized to hold Components
 * within a Registry.  As an Entity, reducers on the state only function as event
 * handlers, and no longer function as reducers.
 */
export class Entity extends Context {
	constructor(components = [], agentObj = {} = {}) {
		super([], agentObj);

		this.mergeConfig({
			isReducer: false,
		});
		
		this.setState(new Registry(components));

		for(let component of components) {
			this.state.addAlias(component.id, component._name);
		}
	}
};

export default Entity;