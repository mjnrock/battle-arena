import Component from "../../../@agency/core/ecs/Component";
import StructPosition from "../struct/Position";

export class Position extends Component {
	static Nomen = "position";

	constructor(entity, seed = {}, { evaluateState = true, ...opts } = {}) {
		super(Position.Nomen, {
			entity,
			template: StructPosition,
			seed: [ seed, { evaluateState }],

			...opts,
		});
	}
};

export default Position;