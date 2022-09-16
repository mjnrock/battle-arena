import Node from "./Node";

export class ObjectNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.OBJECT,
		});
	}
};

export default ObjectNode;