import { System } from "../lib/ecs/System";

export class Animation extends System {
	static Nomen = "animation";

	constructor ({ ...opts } = {}) {
		super(opts);
	}

	attach(entities = [], parent) {
		System.Each(entities, (entity) => {
			parent.addChild(entity.animation.sprite);
		});

		return entities;
	}
	detach(entities = [], parent) {
		System.Each(entities, (entity) => {
			parent.removeChild(entity.animation.sprite);
		});

		return entities;
	}
};

export default Animation;