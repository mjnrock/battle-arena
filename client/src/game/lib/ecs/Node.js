import { Identity } from "../Identity";

/**
 * The main purpose of Node is to allow for Entities to be placed
 * within a tree structure.  As a component, the Node can be used
 * as a data-proxy for the Entity and can be recovered, once traversed,
 * through its .ref property.  Any system controlling the tree structure
 * should perform the traversal and un/packing of the Node to the Entity.
 * Optionally, @state can be added to the node to store additional information,
 * outside of its descendency tree.
 * 
 * IDEA: Node is definitely a component, but it may also be an Entity -- reconcile.
 * NOTE: "in/visible" can be interchanged with "in/active" depending on the context.
 */
export class Node extends Identity {
	constructor ({ ref, parent, children = [], id, tags, ...state } = {}) {
		super({ id, tags });
		/**
		 * A parent reference for any children of this node.
		 */
		this.parent = parent || null;

		/**
		 * The actual children of this node.
		 */
		this.children = new Map();

		/**
		 * The children that are visible when using methods.
		 */
		this.order = [];

		/**
		 * The main reference to which the Node points
		 */
		this.ref = ref;

		this.addChildren(children);

		this.state = {};
		this.setState(state);
	}


	setState(state = {}) {
		if(!Identity.Comparators.IsObject(state)) {
			throw new Error("Node.setState: state must be an object");
		}

		this.state = state;

		return this;
	}
	mergeState(state = {}) {
		if(!Identity.Comparators.IsIterable(state)) {
			throw new Error("Node.mergeState: state must be an iterable");
		}

		this.state = { ...this.state, ...state };

		return this;
	}

	/**
	 * Allow the Node to iterate over its visible children.
	 */
	[ Symbol.iterator ]() {
		const data = this.order.map(id => this.children.get(id));

		return data[ Symbol.iterator ]();
	}

	addChild(childOrId, show = true) {
		let child;
		if(typeof childOrId === "string") {
			child = this.getChild(childOrId);
		} else {
			child = childOrId;
		}

		if(Node.Conforms(child)) {
			this.children.set(child.id, child);
			child.parent = this;

			if(show) {
				this.order.push(child);
			}

		}

		return this;
	}
	addChildren(children, show = true) {
		children.forEach(child => this.addChild(child, show));

		return this;
	}

	removeChild(childOrId) {
		let child;
		if(typeof childOrId === "string") {
			child = this.getChild(childOrId);
		} else {
			child = childOrId;
		}

		if(Node.Conforms(child)) {
			this.children.delete(child.id);
			this.order.splice(this.order.indexOf(child), 1);
		}

		child.parent = null;

		return this;
	}
	removeChildren(children) {
		children.forEach(child => this.removeChild(child));

		return this;
	}

	getChild(idOrIndex) {
		let id;
		if(typeof id === "number") {
			id = this.order[ idOrIndex ];
		} else {
			id = idOrIndex;
		}

		return this.children.get(id);
	}
	getChildren() {
		return this.order.map(uuid => this.children.get(uuid));
	}

	/**
	 * Flag a child as visible.
	 */
	show(id) {
		const child = this.getChild(id);
		if(Node.Conforms(child) && this.order.indexOf(child) === -1) {
			this.order.push(child);
		}

		return this;
	}
	/**
	 * Flag a child as invisible.
	 */
	hide(id) {
		const child = this.getChild(id);
		if(Node.Conforms(child) && this.order.indexOf(child) !== -1) {
			this.order.splice(this.order.indexOf(child), 1);
		}

		return this;
	}
	/**
	 * Swap the order of two children, given their indices.
	 */
	swap(i1, i2) {
		const tmp = this.order[ i1 ];
		this.order[ i1 ] = this.order[ i2 ];
		this.order[ i2 ] = tmp;

		return this;
	}
	/**
	 * Reset the visibility of all children to show all, based on 
	 * original insertion order.
	 */
	reorder() {
		this.order = Array.from(this.children.values());

		return this;
	}

	/**
	 * Reset the Node's descendency tree.
	 */
	empty() {
		this.children = new Map();
		this.order = [];

		return this;
	}

	/**
	 * Use only the visible children of the Node.
	 */
	get isEmpty() {
		return this.order.length === 0;
	}

	/**
	 * This is intended to perform a duck-typing check on @input.
	 */
	static Conforms(input) {
		return Identity.Comparators.Conforms(input, {
			keys: [ "id", "tags", "parent", "children", "order", "ref" ],
			clazz: Node,
		});
	}
};

export default Node;