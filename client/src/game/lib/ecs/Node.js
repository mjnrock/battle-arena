import { Identity } from "../Identity";

export class Node extends Identity {
	constructor ({ ref, parent, children = [], ...rest } = {}) {
		super({ ...rest });
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

		if(child) {
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

		if(child) {
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
		if(child && this.order.indexOf(child) === -1) {
			this.order.push(child);
		}

		return this;
	}
	/**
	 * Flag a child as invisible.
	 */
	hide(id) {
		const child = this.getChild(id);
		if(child && this.order.indexOf(child) !== -1) {
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
};

export default Node;