import Module from "../core/ecs/Module";
import ComponentWebSocketClient from "./ComponentWebSocketClient";

export class ModuleWebSocket extends Module {
	constructor({ entity, system, args = [], tags = [] } = {}) {
		super(`websocket`, {
			entity,
			system,
			componentClass: ComponentWebSocketClient,
			args,
			tags,
		});

		console.log(this)
	}

	static Register(entity, { system, args = [], tags = [] } = {}) {
		return new this({ entity, componentClass: ComponentWebSocketClient, system, args, tags });
	}
};

export default ModuleWebSocket;