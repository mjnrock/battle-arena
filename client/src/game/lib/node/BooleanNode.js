import Node from "./Node";

export class BooleanNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.BOOLEAN,
			encoder: value => !!value,
		});
	}
};

export default BooleanNode;