import Entity from "../../lib/ecs/Entity";

import { DefaultPair as RegistrarPair } from "../components/Registrar";

export class Registrar extends Entity {
	static Name = "registrar";
	static Components = [
		RegistrarPair,
	];

	constructor ({ components = [], id, tags, init = {} } = {}) {
		super({
			name: Registrar.Name,
			components,
			id,
			tags,
			init,
		});
	}
};

export default Registrar;