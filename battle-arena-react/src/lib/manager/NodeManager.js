import Manager from "./Manager";
import Node from "../world/Node";

export class NodeManager extends Manager {
    constructor(game, nodes = []) {
        super(game);

		for(let node of nodes) {
			this.addNode(node);
		}
    }

	_makeAlias(node) {
		const fn = (x, y) => `${ x },${ y }`;

		if(Array.isArray(node)) {
			return fn(...node);
		}

		return fn(node.physics.x, node.physics.y);
	}

	at(x, y) {
		return this[ this._makeAlias([ x, y ]) ];
	}

	addNode(node) {
		if(node instanceof Node) {
			this.addAgent(node, this._makeAlias(node));
		}

		return this;
	}
	removeNode(node) {
		if(node instanceof Node) {
			this.removeAgent(node);
		}

		return this;
	}

	static Initialize(game, size = [], ...nodeArgs) {
		const nodeMgr = new NodeManager(game);
		const [ width, height ] = size;
		
		for(let x = 0; x < width; x++) {
			for(let y = 0; y < height; y++) {
				const node = new Node(...nodeArgs);

				node.physics.x = x;
				node.physics.y = y;

				nodeMgr.addNode(node);
			}
		}

		return nodeMgr;
	}
}

export default NodeManager;