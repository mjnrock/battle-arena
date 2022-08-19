import System from "./System";
import Registry from "../Registry";
import { singleOrArrayArgs } from "../../util/helper";
import Entity from "./Entity";

/**
 * The Manager is a simply a System that maintains a Registry of Entities.
 * It is otherwise identical to a System, but adds a few convenience methods
 * for dispatching to all registered entities, or just some of them.
 * 
 * NOTE that the `dispatch` method is NOT overridden -- so in order to dispatch
 * to all *registered* entities, you must call either `dispatchAll` or `dispatchSome`.
 * This is designed to preserve the ability of a System to dispatch on external Entities.
 */
export class Manager extends System {
	constructor (entities = [], agentObj = {}) {
		super(agentObj);

		this.registry.encoder = Registry.Encoders.InstanceOf(this, Entity);
		this.registry = new Registry(entities);
	}

	dispatchTo(selector = [], event, ...args) {
		const entities = typeof selector === "function" ?  selector(this.registry) : singleOrArrayArgs(selector);

		const next = this.emit(event, entities, ...args);

		return next;
	}
	dispatchAll(event, ...args) {
		const next = this.emit(event, Array.from(this.registry.iterator), ...args);

		return next;
	}
};

export default System;