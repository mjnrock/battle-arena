import Component from "../core/ecs/Component";

export class ComponentWebSocketClient extends Component {
	static System;

	constructor({ connection, middleware = {} } = {}) {
		super();

		this.connection = connection;
		this.middleware = {
			pack: null,
			unpack: null,
			...middleware,
		};
	}
	
	useNodeBuffer() {
		this.connection.binaryType = "nodebuffer";
	}
	useArrayBuffer() {
		this.connection.binaryType = "arraybuffer";
	}
	useFragments() {
		this.connection.binaryType = "fragments";
	}

	isConnecting() {
		return this.connection.readyState === 0;
	}
	isConnected() {
		return this.connection.readyState === 1;
	}
	isClosing() {
		return this.connection.readyState === 2;
	}
	isClosed() {
		return this.connection.readyState === 3;
	}

	static Create(fnOrObj = {}) {
		let args;
		if(typeof fnOrObj === "function") {
			args = fnOrObj();
		} else {
			args = fnOrObj
		}

		return new this(args);
	}
};

export default ComponentWebSocketClient;