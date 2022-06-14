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
	generators: {
		Components: {
			position: [ Component, "position" ],
			velocity: [ Component, "velocity" ],
		},
		Systems: {
			movement: [ System, /* events = {}, */ ],
		},
		Entities: {
			rabbit: Entity,
			squirrel: [ Entity, [
				"position",					// Component name for linking
				"velocity",
				// [ "velocity", -1.3, 0.5 ],	// Component name w/ default args
			] ],
		},
	},
});

//? Confirm environment is created
// console.log(e1);


//? Test that instances are recorded correctly
// console.log(env1.instances.Systems);
// Console.hr();
// console.log(env1.instances[ `@System` ]);

//TODO Remove all Factory associations on the Components (generator and related) and instead use .next/delta paradigm

//? Test that generator Factories are created correctly
// console.log(env1.generators.Systems.movement.create());
// console.log(env1.generators.Components.position.create());
// console.log(env1.generators.Entities.squirrel.create());
// console.log(env1.generators.Entities.rabbit.create());
console.log(env1.E);
console.log(env1.𝔼.rabbit.create());

// Console.label("comp.args.position", env1.generators.Entities.squirrel.args[ 0 ].position);
// Console.label("comp.args.velocity", env1.generators.Entities.squirrel.args[ 0 ].velocity);
// Console.label("comp.position", env1.generators.Entities.squirrel.create().position);
// Console.label("comp.velocity", env1.generators.Entities.squirrel.create().velocity);