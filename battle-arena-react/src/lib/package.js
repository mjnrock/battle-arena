// import Agency from "@lespantsfancy/agency";
import Entity from "./@agency/core/ecs/Entity";
import System from "./@agency/core/ecs/System";

import Game from "./Game";
import Node from "./world/Node";

import SystemPosition from "./data/ecs/system/Position";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});
	
	const node = new Node();

	console.log(node.position.pos);
	System.$(`position`, node)(`move`, 2, 2, 2, false);
	console.log(node.position.pos);

    return game;
}

export default {};