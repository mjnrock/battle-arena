import Node from "./Node";

export class ArrayNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.ARRAY,
		});
	}
};

export default ArrayNode;