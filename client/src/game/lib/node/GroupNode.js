import Node from "./Node";

export class GroupNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.TEXT,
			encoder: data => new Set(data),
		});
	}
};

export default GroupNode;