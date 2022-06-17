import Entity from "./Entity";
import Events from "./Events";

export class System extends Entity {
	constructor (eventObj, { id, tags } = {}) {
		super({ id, tags });

		this.events = new Events(eventObj);
	}
}

export default System;