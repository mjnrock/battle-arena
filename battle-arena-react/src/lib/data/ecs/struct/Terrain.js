import Struct from "../../../@agency/core/ecs/Struct";

export class Terrain extends Struct {
	static Nomen = "terrain";
	
	static Enum = {
		VOID: {
			name: "void",
			type: 0,
			cost: Infinity,
		},
		GRASS: {
			name: "grass",
			type: 1,
			cost: 1,
		},
		DIRT: {
			name: "dirt",
			type: 2,
			cost: 1,
		},
		WATER: {
			name: "water",
			type: 3,
			cost: 5,
		},
	};
	static EnumLookup(nameOrType) {
		for(let key of Object.keys(Terrain.Enum)) {
			if(nameOrType === Terrain.Enum[ key ].name || nameOrType === Terrain.Enum[ key ].type) {
				return Terrain.Enum[ key ];
			}
		}

		return false;
	};

	constructor(state = {}, opts = {}) {
		super({
			terrain: Terrain.Enum.VOID,

			...state,
		}, opts);

		this.$hooks.get.add((target, prop, value) => {
			const flags = [
				"name",
				"type",
				"cost",
			];
			if(flags.includes(prop)) {
				return target.terrain[ prop ];
			}
		});
	}
};

export default Terrain;