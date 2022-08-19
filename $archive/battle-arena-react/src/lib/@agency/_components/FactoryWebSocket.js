import SystemWebSocket from "./SystemWebSocket";

/**
 * This is a use-example of abstracting Systems into something
 * higher level, like a dictionary.  However, this factory
 * is specifically tied to Web Sockets, so a generalized abstraction
 * is still required, but this is meant to provide some semblance
 * of a starting point.
 */
export class FactoryWebSocket {
	static Instance;

	constructor(systemArgs = []) {
		if(!FactoryWebSocket.Instance) {
			FactoryWebSocket.Instance = this;
		} else {
			return FactoryWebSocket.Instance;
		}
		
		this.entries = new Map();
		this.entries.set(`websocket`, new SystemWebSocket(...systemArgs));
	}
	
	static Register(entity, { compArgs = [], tags = [], ...rest } = {}) {
		const system = this.Instance.entries.get(`websocket`);

		return system.register(entity, { system, args: compArgs, tags, ...rest });
	}
};

export default FactoryWebSocket;