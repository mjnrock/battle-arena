import System from "../core/ecs/System";
import WebSocketClient from "./WebSocketClient";

export class SysWebSocket extends System {
	static EnumTriggers = [
		"close",
		"error",
		"message",
		"message_error",
		"open",
		"ping",
		"pong",
		"unexpected_response",
		"upgrade",
	];

	constructor({ ...opts } = {}) {
		super({ ...opts });
		
		this.qualifier = (node) => {
			if([ ...node.components.values() ].some(comp => WebSocketClient.Has(comp))) {
				return true;
			}

			return false;
		}

		this.addTrigger("event", (trigger, component, ...args) => {
			if(trigger === "message") {
				let msg;
				if (typeof component.middleware.unpack === "function") {
					const data = component.middleware.unpack(args);
		
					msg = Signal.Create({ emitter: component, type: trigger, data });
				} else {
					msg = Signal.Create({ emitter: component, type: trigger, data: args });
				}

				this.invoke(msg);
			} else {
				this.invoke(trigger, ...args);
			}
		});
	}

	bind(comp, resetListeners = false) {
		if(resetListeners) {
			comp.connection.removeAllListeners();
		}

		let listeners = [];
		for(let trigger of EnumTriggers) {
			let listener = [ trigger, (...args) => this.invoke("event", trigger, component, ...args) ];

			comp.connection.addEventListener(...listener);
			listener.push(listener);
		}

		return listeners;
	}
	unbind(comp, listeners) {
		for(let listener of listeners) {
			comp.connection.removeEventListener(...listener);
		}

		return comp;
	}
	
	connect(comp, { url, host, protocol = "http", port, ws, resetListeners } = {}) {
		if (ws instanceof WebSocket) {
			comp.connection = ws;
		} else if (host && protocol && port) {
			comp.connection = new WebSocket(`${ protocol }://${ host }:${ port }`);
		} else {
			comp.connection = new WebSocket(url);
		}

		this.bind(comp, resetListeners);

		return comp;
	}

	send(comp, signal) {
		if (comp.isConnected()) {
			//TODO Transform payload into a Signal
			comp.connection.send(signal);

			return true;
		}

		return false;
	}

	disconnect(comp, code, reason, timeout = false) {
		comp.connection.close(code, reason);

		if (typeof timeout === "number" && timeout > 0) {
			setTimeout(() => {
				try {
					if (!comp.isClosed()) {
						comp.kill();
					}
				} catch (e) {
					comp.invoke("error", e);
				}
			}, timeout);
		}
	}
	kill(comp) {
		comp.connection.terminate();
	}
};

WebSocketClient.System = SysWebSocket;

export default SysWebSocket;