import Entity from "../core/ecs/Entity";
import FactoryWebSocket from "./FactoryWebSocket";

export class EntityWebSocket extends Entity {
	constructor({ WebSocket = {} } = {}) {
		super();

		FactoryWebSocket.Register(this, {
			compArgs: WebSocket.args || [],
			tags: WebSocket.tags || [],
		});
	}
};



export default EntityWebSocket;