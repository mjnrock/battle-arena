import System from "../@agency/core/ecs/System";


//TODO Convert this into << extends Context >> and refactor accordingly



/**
 ** The Manager is similar to a System, except that it keeps explicit track of Entities and Components that it is allowed to act on
 ** This concept is the starting point for EntityManager
 **/
export class Manager extends System {
    constructor(game, nomen, entities = []) {
        super(nomen, [], {
			state: {
				game,
			},
		}, entities);
    }

	comp(id) {
		const entity = this.registry.get(id);

		if(entity) {
			return entity.comp(this.nomen);
		}
	}
	get getComponent() {
		return this.comp;
	}

	to(trigger, ...args) {
		return this.forEach(entity => entity.to(this.nomen, trigger, ...args));
	}
	/**
	 * .trigger is the custom override for the .invoke method
	 * Use this prefernetially over .invoke
	 */
	trigger(trigger, ...args) {
		return this.forEach(entity => entity.trigger(trigger, ...args));
	}

	getGame() {
		return this.state.game;
	}

	getEntity(id) {
		return this.registry.get(id);
	}
	getEntities() {
		return this.registry.values();
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

	removeEntity(entity) {
		this.registry.delete(entity.id);

		return this;
	}

	removeEntities(entities) {
		for(let entity of entities) {
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

	forEach(fn) {
		const results = new Map();
		for(let entity of this.registry.values()) {
			if(typeof fn === "function") {
				results.set(entity.id, fn(entity, this));
			}
		}

		return results;
	}
}

export default Manager;