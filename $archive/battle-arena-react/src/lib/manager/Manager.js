import Context from "../@agency/core/Context";
import Entity from "../@agency/core/ecs/Entity";

export class Manager extends Context {
	constructor (game, entities = []) {
		super(entities, {
			state: {
				game,
			},
		});
	}

	/**
	 * .trigger is the custom override for the .invoke method
	 * Use this prefernetially over .invoke
	 */
	trigger(trigger, ...args) {
		return this.forEach(entity => entity.trigger(trigger, ...args));
	}
	to(nomen, trigger, ...args) {
		return this.forEach(entity => entity.to(nomen, trigger, ...args));
	}

	getGame() {
		return this.state.game;
	}

	getEntity(id) {
		return this.registry.get(id);
	}
	getEntities(ids = []) {
		if(!ids.length) {
			return this.registry.values();
		}

		const results = new Set();
		for(let id of ids) {
			const entity = this.getEntity(id);

			if(entity) {
				results.add(entity);
			}
		}

		return results.values();
	}

	hasEntity(id) {
		return this.registry.has(id);
	}

	setEntities(entities) {
		return this.clearEntities().addEntities(entities);
	}


	addEntity(entity) {
		this.registry.set(entity.id, entity);

		return this;
	}
	addEntities(entities) {
		for(let entity of entities) {
			this.addEntity(entity);
		}

		return this;
	}

	findEntity(selector) {
		let entity;

		for(let [ id, entity ] of this.registry) {
			if(selector(entity)) {
				return entity;
			}
		}

		return entity;
	}
	findEntities(selector) {
		const results = new Set();

		for(let [ id, entity ] of this.registry) {
			if(selector(entity)) {
				results.add(entity);
			}
		}

		return results.values();
	}

	removeEntity(entityOrId) {
		this.registry.delete(entityOrId instanceof Entity ? entityOrId.id : entityOrId);

		return this;
	}

	removeEntities(removeEntityArgs = []) {
		for(let entity of removeEntityArgs) {
			this.removeEntity(entity);
		}

		return this;
	}

	clearEntities() {
		this.registry.clear();

		return this;
	}

	getEntityCount() {
		return this.registry.size;
	}
}

export default Manager;