import { System } from "../../lib/ecs/System";

export class Realm extends System {
	static Alias = "realm";

	constructor ({ ...opts } = {}) {
		super(opts);
	}
};

export default Realm;