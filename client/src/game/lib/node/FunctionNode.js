import Node from "./Node";

export class FunctionNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.FUNCTION ,
			encoder: data => new Set(data),
		});
	}
};

export default FunctionNode;