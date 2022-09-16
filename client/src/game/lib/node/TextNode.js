import Node from "./Node";

export class TextNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.TEXT,
		});
	}
};

export default TextNode;