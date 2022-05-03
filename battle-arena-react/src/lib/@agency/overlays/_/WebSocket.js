import { v4 as uuid } from "uuid";
import WebSocket from "ws";

import Node from "../node/Node";

export const EnumTriggers = [
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

//TODO Create an isomorphic client and server for browser & nodejs
// Magic object that interacts with registry ({ $state, $actions, etc. })
export const WebSocketNodeClient = (target, { $state, $actions } = {}) => {
	const $  = target.meta.state;

	return {
		// state: {},
		// nodes: {},
		triggers: [
			...EnumTriggers,
		],
		// subscriptions: [],
		meta: {
			state: {				// Take the meta states for each Overlay, register with $id into neta state registry -- is stored like target.meta.state[ $id ]{ ... }
				$id: uuid(),

				connection: null,
				middleware: {
					pack: null,
					unpack: null,
				},
			}
		},
		config: {
		},
		actions: {
			useNodeBuffer() {
				$.connection.binaryType = "nodebuffer";
			},
			useArrayBuffer() {
				$.connection.binaryType = "arraybuffer";
			},
			useFragments() {
				$.connection.binaryType = "fragments";
			},
			
			connect({ url, host, protocol = "http", port, ws } = {}) {
				if (ws instanceof WebSocket) {
					$.connection = ws;
				} else if (host && protocol && port) {
					$.connection = new WebSocket(`${ protocol }://${ host }:${ port }`);
				} else {
					$.connection = new WebSocket(url);
				}
		
				target.bind($.connection);
		
				return target;
			},
			bind(client) {			
				client.addEventListener("close", (code, reason) => target.actions.invoke("close", code, reason));
				client.addEventListener("error", (error) => target.actions.invoke("error", error));
				client.addEventListener("message", (packet) => {
					try {
						//TODO Refactor for Hive
						// let msg;
						// if (typeof $.middleware.unpack === "function") {
						// 	const { type, payload } = $.middleware.unpack.call(target, packet);
		
						// 	msg = Message.Generate(target, type, ...payload);
						// } else {
						// 	msg = packet;
						// }
		
						target.actions.invoke("message", msg);
					} catch (e) {
						target.actions.invoke("message_error", e, packet);
					}
				});
				client.addEventListener("open", () => target.actions.invoke("open"));
				client.addEventListener("ping", (data) => target.actions.invoke("ping", data));
				client.addEventListener("pong", (data) => target.actions.invoke("pong", data));
				client.addEventListener("unexpected-response", (req, res) => target.actions.invoke("unexpected_response", req, res));
				client.addEventListener("upgrade", (res) => target.actions.invoke("upgrade", res));

				return target;
			},

			isConnecting() {
				return $.connection.readyState === 0;
			},
			isConnected() {
				return $.connection.readyState === 1;
			},
			isClosing() {
				return $.connection.readyState === 2;
			},
			isClosed() {
				return $.connection.readyState === 3;
			},
			
			sendToServer(data) {
				if (target.actions.isConnected()) {
					// let data;
					// if (typeof this.middleware.pack === "function") {
					// 	if (Message.Conforms(event)) {
					// 		data = this.middleware.pack.call(this, event.type, ...event.data);
					// 	} else {
					// 		data = this.middleware.pack.call(this, event, ...payload);
					// 	}
					// } else {
					// 	data = [ event, payload ];
					// }
		
					$.connection.send(data);
		
					return true;
				}
		
				return false;
			},
		
			disconnect(code, reason, timeout = false) {
				$.connection.close(code, reason);
		
				if (typeof timeout === "number" && timeout > 0) {
					setTimeout(() => {
						try {
							if (!target.actions.isClosed()) {
								target.actions.kill();
							}
						} catch (e) {
							target.actions.invoke("error", e);
						}
					}, timeout);
				}
			},
			kill() {
				$.connection.terminate();
			},
		},
	};
};

export default WebSocketNodeClient;