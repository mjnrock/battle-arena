import Component from "../../../@agency/core/ecs/Component";
import StructPosition from "../struct/Position";

export class Position extends Component {
	static Nomen = "position";

	constructor(entity, seed = {}, { evaluateState = true, ...opts } = {}) {
		super(Position.Nomen, {
			entity,
			template: StructPosition,
			seed: [{
				x: 0,
				y: 0,
				z: 0,
		
				...seed,
			}, { evaluateState }],

			...opts,
		});
	}

	static Create(entity, seed = {}, { evaluateState = true, ...opts } = {}) {
		return new this(entity, seed, { evaluateState, ...opts });
	}
	static Factory(qty = 1, fnOrObj, each) {
		// Single-parameter override for .Spawning one (1) this
		if(typeof qty === "function" || typeof qty === "object") {
			fnOrObj = qty;
			qty = 1;
		}

		let components = [];
		for(let i = 0; i < qty; i++) {
			let component = this.Create(typeof fnOrObj === "function" ? fnOrObj(i, qty) : fnOrObj);

			components.push(component);

			if(typeof each === "function") {
				each(component);
			}
		}

		return components;
	}
};

export default Position;