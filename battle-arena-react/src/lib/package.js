import Game from "./Game";
import Node from "./world/Node";
import Animus from "./world/Animus";

import "./data/ecs/component/seed";
import "./data/ecs/entity/seed";

import Terrain from "./data/ecs/struct/Terrain";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});



	
	const node = new Node({
		terrain: Terrain.Enum.WATER,
	}, {
		state: {
			cats: Math.random() * 2,
		},
	});

	const [ e1, e2, e3 ] = Animus.Factory(3, [{
		position: {
			x: () => Math.random(),
			y: () => Math.random(),
			z: () => Math.random(),
		}
	}, () => ({
		state: {
			cats: Math.random() * 2,
		},
	})]);

	
	// e1.attach("terrain", Terrain.Enum.GRASS)
	e1.attach({
		terrain: Terrain.Enum.GRASS,
		// terrain: [ Terrain.Enum.GRASS, {} ],
	});


	const includeId = false;
	console.log(e1.toObject(includeId));
	console.log(e2.toObject(includeId));
	console.log(e3.toObject(includeId));
	console.log(node.toObject(includeId));

	// System.$(`position`, node)(`move`, 2, 2, 2, false);
	// SystemPosition.$(node)(`move`, 3, 3, 3, false);

    return game;
}

export default {};