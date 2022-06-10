import Registry from "../Registry";
import Component from "./Component";

import { singleOrArrayArgs } from "./../../util/helper";

/**
 * An Entity is a Registry for Components (state), allowing for a centralized System (reducer) to
 * manage the state of the Entity viz-a-viz the Components.  The System is responsible for
 * assigning the new state of the Components, and as such, the Entity should be treated as a
 * read-only container object.
 */
export class Entity extends Registry {
	constructor (components = [], { parent, children = [], agencyBase = {} } = {}) {
		super([], agencyBase);

		components = singleOrArrayArgs(components);
		for(let component of components) {
			this.registerWithAlias(component, component.name);
		}

		this.parent = parent;
		this.children = new Registry(children);
	}

	registerComponent(component) {
		this.registerWithAlias(component, component.name);

		return this;
	}
	registerComponents(components = []) {
		if(typeof components === "object" && !Array.isArray(components)) {
			const next = {};
			for(let [ name, component ] of Object.entries(components)) {
				next[ name ] = component.generator(component, name)
			}
			
			components = Object.values(next);
		}

		components = singleOrArrayArgs(components);

		for(let component of components) {
			this.registerComponent(component);
		}

		return this;
	}
	unregisterComponent(component) {
		this.unregister(component.id);

		return this;
	}
	unregisterComponents(components = []) {
		components = singleOrArrayArgs(components);

		for(let component of components) {
			this.unregisterComponent(component);
		}

		return this;
	}

	/**
	 * Convenience method for Component creation and registration.
	 * Use .unregister() to remove the Component.
	 */
	createComponent(name, state = {}, { id, tags } = {}) {
		const component = new Component(name, state, { id, tags });

		this.registerWithAlias(component, name);

		return component;
	}

	// #region Graph Structure
	addChild(child) {
		this.children.add(child);
		child.parent = this;

		return this;
	}
	addChildren(children = []) {
		children = singleOrArrayArgs(children);

		for(let child of children) {
			this.addChild(child);
		}

		return this;
	}
	removeChild(child) {
		this.children.delete(child);
		child.parent = null;

		return this;
	}
	removeChildren(children = []) {
		children = singleOrArrayArgs(children);

		for(let child of children) {
			this.removeChild(child);
		}

		return this;
	}

	addParent(parent) {
		this.parent = parent;
		parent.children.add(this);

		return this;
	}
	removeParent(parent) {
		this.parent = null;
		parent.children.delete(this);

		return this;
	}

	getChildAt(index) {
		return Array.from(this.children.iterator)[ index ];
	}
	getChildren(selector) {
		if(selector == null) {
			return Array.from(this.children.iterator);
		}

		if(typeof selector === "string") {
			return Array.from(this.children.iterator).filter(child => child.id === selector);
		} else if(Array.isArray(selector)) {
			return Array.from(this.children.iterator).filter(child => selector.includes(child.id));
		} else if(typeof selector === "function") {
			return Array.from(this.children.iterator).filter(selector);
		}

		return [];
	}


	//#endregion Graph Structure

	static Create(...args) {
		return new this(...args);
	}
	static Factory(qty = 1, fnOrArgs = [], each) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrArgs = qty;
			qty = 1;
		}

		if(!Array.isArray(fnOrArgs)) {
			fnOrArgs = [ fnOrArgs ];	// Make sure @fnOrArgs is an Array (primarily a convenience overload for Entity Factory, but is useful elsewhere)
		}

		let entities = [];
		for(let i = 0; i < qty; i++) {
			let args = fnOrArgs;
			if(typeof fnOrArgs === "function") {
				args = fnOrArgs(i);
			}

			const entity = this.Create(...args);
			entities.push(entity);

			if(typeof each === "function") {
				each(i, entity);
			}
		}

		return entities;
	}
};

export default Entity;