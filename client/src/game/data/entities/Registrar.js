import Entity from "../../lib/ecs/Entity";

import { DefaultPair as RegistrarPair } from "../components/Registrar";

export class Registrar extends Entity {
	static Components = [
		RegistrarPair,
	];

	constructor ({ components = [], id, tags, init = {} } = {}) {
		super({
			name: "registrar",
			components,
			id,
			tags,
			init,
		});
	}
};

export default Registrar;