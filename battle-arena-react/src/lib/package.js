// import Agency from "@lespantsfancy/agency";
import Context from "./@agency/core/Context";
import Entity from "./@agency/core/ecs/Entity";

import Game from "./Game";

import worldHandlers from "./data/handlers/context/world";
import Component from "./@agency/core/ecs/Component";
import Struct from "./@agency/core/ecs/Struct";
import Node from "./world/Node";
import SystemPosition from "./data/ecs/system/Position";
import ComponentPosition from "./data/ecs/component/Position";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});

	//? Context is the "Group Agent", @worldHandlers comes from /data
	const world = new Entity([
		
	]);
	const node = new Node();
	// const universe = new Context([
	// 	world,
	// ], {
	// 	triggers: worldHandlers,
	// });

	
	console.log(node.comp`position`);
	console.log(node.position);

	console.log(node.position.pos);
	// console.log(node.position.posObj);
	SystemPosition.$("move", 2, 2, 2, false)(node);		// === SystemPosition.Instances.get(`default`).trigger("move", node, 2, 2, 2, false);	
	SystemPosition.$("move", 2, 2, 2, true)([ node ]);		// === SystemPosition.Instances.get(`default`).trigger("move", node, 2, 2, 2, false);	
	console.log(node.position.pos);

	console.log(ComponentPosition.Create(world, {
		x: () => Math.random(),
		y: () => Math.random(),
		z: () => Math.random(),
	}, { evaluateState: true }));
	console.log(ComponentPosition.Factory(1, [ world, {
		x: () => Math.random(),
		y: () => Math.random(),
		z: () => Math.random(),
	}, { evaluateState: true } ]));
	// console.log(node.position.posObj);

	// console.log(universe);
	// console.log(world);
	// console.log(world.physics.x);
	// universe.trigger("join", Date.now())

    return game;
}

export default {};