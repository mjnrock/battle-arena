import Relay from "@lespantsfancy/relay";
import Identity from "../Identity";
import Registry from "../Registry";

export class System extends Identity {
	constructor (handlers = {}, { id, tags } = {}) {
		super({ id, tags });

		this.handlers = new Relay.System(handlers);
	}

	invoke(entities = [], type, data, opts = {}) {
		if(entities instanceof Registry) {
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