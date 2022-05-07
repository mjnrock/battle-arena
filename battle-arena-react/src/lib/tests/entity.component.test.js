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
		Component.Create("physics", {
			seed: [{
				x: () => Math.random(),
				y: () => Math.random(),
				z: () => Math.random(),
			}, { evaluateState: true }],	// TRUE evaluates state values as seed functions
			tags: [
				`world`,
			],
		}),
		Component.Create("fuzzums", {
			seed: [{
				cat: "Shey Poofs",
				weasile: "Buddhies",
			}, { evaluateState: false }],	// TRUE evaluates state values as seed functions
			tags: [
				`creature`,
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
	world.comp`physics`.reseed();
	console.log(world.physics.x);
	world.comp(`physics`).reseed();
	console.log(world.physics.x);
	console.log(world.fuzzums);
	universe.trigger("join", Date.now())

    return game;
}

export default {};