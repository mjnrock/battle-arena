import Node from "./Node";

export class EnumNode extends Node {
	constructor ({ ...node } = {}) {
		super({
			...node,

			type: Node.EnumType.ENUM,
			// encoder: 
			// decoder: data => {
			// 	if(data in this.data) {
			// 		return this.data[ data ];
			// 	}

			// 	return void 0;
			// },
		});

		this.encoder = data => {
			console.log(data);
			if(data in this.data) {
				return this.data[ data ];
			}

			return void 0;
		};
	}
};

export default EnumNode;