import Console from "../../util/Console";

import System from "../../$next/ecs/System";
import Entity from "../../$next/ecs/Entity";
import Component from "../../$next/ecs/Component";
import Environment from "./../../$next/ecs/Environment";

Console.NewContext();

const s1 = new System();
const c1 = new Component("test");
const e1 = new Entity([
	c1,
]);
// const e1 = new Entity({
// 	test2: c1,
// });

const env1 = new Environment({
	instances: [ s1, e1, c1 ],

	//FIXME .generators should hold Factory instances, generated from this object schema
	//? Wrap the generator function and ensure classifiers are applied
	generators: {
		Component: Component,
		Entity: Entity,
		System: [ System, /* ...defaultArgs, */ ],	// If an array, the first element is the class, the rest are the default args

		Components: {
			position: [ Component, "position" ],
			velocity: [ Component, "velocity" ],
		},
		Systems: {
			movement: [ System, /* events = {}, */ ],
		},
		Entity: {
			squirrel: [ Entity, [
				"position",					// Component name for linking
				[ "velocity", -1.3, 0.5 ],	// Component name w/ default args
			] ],
		},
	},
});

// console.log(e1);
console.log(env1.generators);
// console.log(env1.instances.Systems);
// Console.hr();
// console.log(env1.instances[ `@System` ]);