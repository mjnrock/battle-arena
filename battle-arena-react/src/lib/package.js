// import Agency from "@lespantsfancy/agency";
import Context from "./@agency/core/Context";
import Entity from "./@agency/core/ecs/Entity";

import Game from "./Game";

import worldHandlers from "./data/handlers/context/world";
import Component from "./@agency/core/ecs/Component";
import Struct from "./@agency/core/ecs/Struct";
import Node from "./world/Node";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});

	//? Context is the "Group Agent", @worldHandlers comes from /data
	const world = new Entity([
		
	]);
	const node = new Node();
	const universe = new Context([
		world,
	], {
		triggers: worldHandlers,
	});

	console.log(node.position);
	console.log(node.position.pos(true));
	// console.log(universe);
	// console.log(world);
	// console.log(world.physics.x);
	// universe.trigger("join", Date.now())

    return game;
}

export default {};