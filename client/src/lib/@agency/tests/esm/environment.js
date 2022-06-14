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

	//? Wrap the generator function and ensure classifiers are applied
	//FIXME .generators should hold Factory instances, generated from this object schema
	generators: {
		// Component: Component,
		// Entity: Entity,
		// System: [ System, /* ...defaultArgs, */ ],	// If an array, the first element is the class, the rest are the default args

		Components: {
			position: [ Component, "position" ],
			velocity: [ Component, "velocity" ],
		},
		Systems: {
			movement: [ System, /* events = {}, */ ],
		},
		Entities: {
			squirrel: [ Entity, [
				"position",					// Component name for linking
				[ "velocity", -1.3, 0.5 ],	// Component name w/ default args
			] ],
		},
	},
});

// console.log(e1);

//? Test that instances are recorded correctly
// console.log(env1.instances.Systems);
// Console.hr();
// console.log(env1.instances[ `@System` ]);

// Test that generator Factories are created correctly
console.log(env1.generators.Systems.movement.create());
console.log(env1.generators.Components.position.create());
console.log(env1.generators.Entities.squirrel.create());