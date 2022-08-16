export class BinaryTreeLeaf {
	constructor(value) {
		if(value === void 0) {
			throw new Error("BinaryTreeLeaf: @value cannot be undefined.");
		}

		this.value = value;
	}

	static From(value) {
		return new BinaryTreeLeaf(value);
	}
};

export class BinaryTreeNode {
	constructor({ proposition, left, right } = {}) {
		if(typeof proposition !== "function") {
			throw new Error("BinaryTreeNode: @proposition must be a function.");
		}

		this.proposition = proposition;
		this.left = left;
		this.right = right;
	}

	get(...args) {
		if(this.proposition(...args)) {
			return this.left;
		} else {
			return this.right;
		}
	}
	set({ proposition, left, right }) {
		this.proposition = proposition || this.proposition;
		this.left = left || this.left;
		this.right = right || this.right;
	}

	static From({ proposition, left, right } = {}) {
		return new BinaryTreeNode({ proposition, left, right });
	}
};

export class BinaryTree {
	constructor() {
		this.root = null;
	}
};