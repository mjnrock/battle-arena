// import Agency from "@lespantsfancy/agency";
import Context from "./@agency/core/Context";
import Entity from "./@agency/core/ecs/Entity";

import Game from "./Game";

import worldHandlers from "./data/handlers/world";
import Component from "./@agency/core/ecs/Component";
import Struct from "./@agency/core/ecs/Struct";

export function CreateGame() {
    const game = new Game({
		fps: 2,
	});

	//? Context is the "Group Agent", @worldHandlers comes from /data
	const world = new Entity([
		Component.Create("space", {
			// template: StructSpace,
			seed: [{
				x: [ 0, 20 ],
				y: [ 0, 20 ],
				z: 0,
			}, { evaluateState: true }],	// TRUE evaluates state values as seed functions
			tags: [
				`world`,
			],
		}),
		Component.Create("entity", {
			// template: StructSpace,
			seed: [{
				x: [ 0, 20 ],
				y: [ 0, 20 ],
				z: 0,
			}, { evaluateState: true }],	// TRUE evaluates state values as seed functions
			tags: [
				`world`,
			],
		}),
	]);
	const universe = new Context([
		world,
	], {
		triggers: worldHandlers,
	});

	console.log(universe);
	console.log(world);
	console.log(world.physics.x);
	universe.trigger("join", Date.now())

    return game;
}

export default {};