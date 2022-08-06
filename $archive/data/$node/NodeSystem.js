import { System } from "../../../client/src/game/lib/ecs/System";

export class NodeSystem extends System {
	constructor({ name, handlers, ...opts } = {}) {
		super({ name, ...opts });

		this.events.addHandlers({
			activate: this.activate.bind(this),
			
			...handlers,
		});
	}

	//TODO Rename the params to be actual Message properties
	activate({ entities, path, args, ...relayMessage }) {
		//TODO Extract the Node and iterate over its children, activating them, too.
	}
}