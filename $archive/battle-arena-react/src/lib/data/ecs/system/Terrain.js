import System from "../../../@agency/core/ecs/System";

import StructTerrain from "../struct/Terrain";


export class Terrain extends System {
	static Nomen = StructTerrain.Nomen;

	static $(...entities) {
		return super.$(StructTerrain.Nomen, ...entities);
	}
	$(...entities) {
		return super.$(StructTerrain.Nomen, ...entities);
	}
	
	constructor() {
		super(StructTerrain.Nomen);
	}
};

System.Registry.set(StructTerrain.Nomen, new Terrain());

export default Terrain;