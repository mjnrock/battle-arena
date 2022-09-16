import Identity from "./../../util/Identity";
import Events from "./../../util/relay/Events";

export const EnumType = {
	DATA: "data",
	ROUTER: "router",

	GROUP: "group",
	BOOLEAN: "boolean",
	NUMBER: "number",
	TEXT: "text",
	OBJECT: "object",
	ARRAY: "array",

	ENUM: "enum",
	FUNCTION: "function",
	CLASS: "class",
};

export class Node extends Identity {
	static Error = {
		Unspecified: `1461EDE9-6172-4DD3-A27A-7AD5762C8A53`,
	};

	static EnumType = EnumType;
	static Encoder = (self, value, ...args) => {
		if(value) {
			return self.meta.encoder(value, ...args);
		}

		return void 0;
	};
	static Decoder = (self, value, ...args) => {
		if(value) {
			return self.meta.decoder(value, ...args);
		}

		return value;
	};

	constructor ({ type, data, events = {}, id, tags, encoder, decoder, ...meta } = {}) {
		super({ id, tags });

		/**
		 * A unique identifier for the type of node, exhaustively defined by the
		 * EnumType object (also accessible via the static property of the same).
		 */
		this.type = type || EnumType.DATA;

		/**
		 * A collection of events that can be triggered by the node.  To create attachments
		 * to the node, create a new event and attach a listener to it.
		 */
		this.events = new Events(events);

		/**
		 * A collection of metadata associated with the node.  All entries in this
		 * object are use-case specific.
		 */
		this.meta = {
			...meta,

			/**
			 * The encoder is responsible for the "logical" encoding of the node's
			 * data.  This is used to convert the data into a format that is consistent
			 * with the node's type (e.g. Int8:Number, or Email:String).
			 * 
			 * As this result is stored, the encoder should enforce any constraints.
			 */
			encoder: encoder || (value => value),

			/**
			 * The decoder is responsible for the "logical" decoding of the node's
			 * data.  This is used to convert the raw data into a format that is consistent
			 * with the node's type (e.g. Int8:Number, or Email:String).
			 */
			decoder: decoder || (value => value),

			/**
			 * The timestamp of creation of the node.
			 */
			timestamp: Date.now(),
		};

		/**
		 * Create the proxy before populating data, so that the proxy can be
		 * hooked by encoder.
		 */
		const proxy = new Proxy(this, {
			get: (target, key) => {
				let value = target[ key ];

				/**
				 * If fetching data, invoke the decoder.
				 */
				if(key === "data") {
					return target.constructor.Decoder(target, value);
				}

				return value;
			},
			set: (target, key, value) => {
				/**
				 * If assigning data, invoke the encoder.
				 */
				if(key === "data") {
					target[ key ] = target.constructor.Encoder(target, value, target[ key ]);

					return true;
				}

				return Reflect.set(target, key, value);
			},
		});

		/**
		 * The data associated with the node. The type of data is determined by the
		 * type of node.
		 */
		proxy.data = data;

		return proxy;
	}

	dispatch(event, ...args) {
		return this.events.emit(event, ...args);
	}
};

export default Node;