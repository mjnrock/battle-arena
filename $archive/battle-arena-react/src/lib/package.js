import Game from "./Game";
import WorldManager from "./manager/WorldManager";
import World from "./world/World";
import Node from "./world/Node";
import Animus from "./world/Animus";

import "./data/ecs/component/seed";
import "./data/ecs/entity/seed";

import Terrain from "./data/ecs/struct/Terrain";

/**
 ** Use "Mainloop.js" for the game loop
 ** Use "Matter.js" for the physics engine
 ** Use "Pixi.js" for the graphics engine (DOM only)
 */

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});
	
	game.mergeState({
		world: new WorldManager(game),
	});
	
	const { world } = game.state;
	world.mergeState({
		overworld: new World(game, [ 5, 5 ]),
	});
	
	const $game = game.$.bind(game);
	console.log($game(`world.overworld`));
	console.log($game`world.overworld`);
	console.log($game`world.overworld`.nodes);
	console.log($game`world.overworld`.nodes[`3,2`]);
	console.log($game`world.overworld`.nodes.at(3, 2));
	console.log($game`world.overworld`.nodes.at(4, 1));



	
	const node = new Node({
		terrain: Terrain.Enum.WATER,
	});

	const [ e1, e2, e3 ] = Animus.Factory(3, () => ({
		physics: {
			x: Math.random(),
			y: Math.random(),
			z: Math.random(),
		}
	}));
	
	e1.attach({
		terrain: Terrain.Enum.GRASS,
	});


	const includeId = false;
	console.log(e1.toObject(includeId));
	console.log(e2.toObject(includeId));
	console.log(e3.toObject(includeId));
	console.log(node.toObject(includeId));

	// System.$(`physics`, node)(`move`, 2, 2, 2, false);
	// SystemPosition.$(node)(`move`, 3, 3, 3, false);

    return game;
}

export default {};