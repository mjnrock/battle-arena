import Relay from "@lespantsfancy/relay";
import Identity from "../Identity";
import Registry from "../Registry";
import Entity from "./Entity";

export class System extends Identity {
	constructor ({ handlers = {}, id, tags, name } = {}) {
		super({ id, tags });

		this.name = name;
		this.handlers = new Relay.System(handlers);
	}
	
	get(entity) {
		if(entity.has(this.name)) {
			return entity.get(this.name);
		}

		return false;
	}
	set(entity, data) {
		entity.update(this.name, data);

		return entity;
	}

	invoke(entities = [], type, data, opts = {}) {
		if(entities instanceof Registry && !(entities instanceof Entity)) {
			entities = Array.from(entities.values);
		}

		if(!Array.isArray(entities)) {
			entities = [ entities ];
		}

		const msg = type instanceof Relay.Message ? type : new Relay.Message({ type, data, entities, ...opts });

		return this.handlers.receive(msg);
	}
};

export default System;