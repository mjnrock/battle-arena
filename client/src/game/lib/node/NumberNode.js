import Node from "./Node";

export class NumberNode extends Node {
	static Error = {
		...Node.Error,

		OutOfBounds: `B4B685D9-0AF3-4D89-92FF-394C696451A0`,
	};

	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.NUMBER,
		});
	}
};

export const NumberTypes = {
	INT8: {
		min: -128,
		max: 127,
	},
	UINT8: {
		min: 0,
		max: 255,
	},
	INT16: {
		min: -32768,
		max: 32767,
	},
	UINT16: {
		min: 0,
		max: 65535,
	},
	INT32: {
		min: -2147483648,
		max: 2147483647,
	},
	UINT32: {
		min: 0,
		max: 4294967295,
	},
	FLOAT16: {
		min: -65504,
		max: 65504,
	},
	FLOAT32: {
		min: -3.4028234663852886e+38,
		max: 3.4028234663852886e+38,
	},
};

for(let [ key, obj ] of Object.entries(NumberTypes)) {
	const { min, max } = obj;

	/**
	 * Create the encoders and decoders for each type
	 */
	let coder = {};
	if(key.includes("INT")) {
		coder = {
			encoder: (value) => {
				value = parseInt(value);

				if(value >= min && value <= max) {
					return value;
				}

				return NumberNode.Error.OutOfBounds;
			},
			decoder: (value) => value,
		};
	} else {
		coder = {
			encoder: (value) => {
				value = parseFloat(value);

				if(value >= min && value <= max) {
					return value;
				}

				return NumberNode.Error.OutOfBounds;
			},
			decoder: (value) => value,
		};
	}

	/**
	 * Create a data object for each type, containing the min and max values,
	 * the encoder and decoder functions, as well as instantiation helpers.
	 */
	NumberNode[ key ] = {
		min,
		max,
		...coder,
		create: (args = {}) => {
			const node = new NumberNode({
				...args,
				...coder,
			});

			node.meta.type = key.toLowerCase();

			return node;
		},
		factory: (qty, args = {}) => {
			return new Array(qty).fill(0).map(() => NumberNode[ key ].create(args));
		},
	};
}

export default NumberNode;