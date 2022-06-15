import Console from "../../util/Console";

import System from "../../$next/ecs/System";
import Entity from "../../$next/ecs/Entity";
import Component from "../../$next/ecs/Component";
import Environment from "./../../$next/ecs/Environment";

Console.NewContext();

const s1 = new System({
	test: [
		() => {},
		() => {},
		() => {},
		() => {},
	],
	test2: [
		() => {},
		() => {},
	],
});
const c1 = new Component("test", {
	cats: "meow",
});
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
			squirrel: [
				Entity,
				[
					"position",					// Component name for linking
					[ "velocity", {
						x: -1.3,
						y: 0.5,
					} ],	// Component name w/ default args
				]
			],
		},
	},
});

Console.hr();

//? Confirm environment is created
// console.log(e1);


//? Test that instances are recorded correctly
// console.log(env1.instances.Systems);
// Console.hr();
// console.log(env1.instances[ `@System` ]);


//? Verify that iterators work
// for(let a of e1) {
// 	console.log(9999, a)
// }
// for(let a of c1) {
// 	console.log(7777, a)
// }
for(let a of s1) {
	console.log(5555, a)
}

//? Test that generator Factories are created correctly
// console.log(env1.generators.Systems.movement.create());
// console.log(env1.generators.Components.position.create());
// console.log(env1.generators.Entities.squirrel.create());
// console.log(env1.generators.Entities.rabbit.create());
// console.log(env1.E);
// console.log(env1.𝔼.squirrel.create());
// console.log(env1.𝔼.rabbit.create());

// Console.label("comp.args.position", env1.generators.Entities.squirrel.args[ 0 ].position);
// Console.label("comp.args.velocity", env1.generators.Entities.squirrel.args[ 0 ].velocity);
// Console.label("comp.position", env1.generators.Entities.squirrel.create().position);
// Console.label("comp.velocity", env1.generators.Entities.squirrel.create().velocity);

// console.log(env1.𝔼)
const { 𝔼, ℂ, 𝕊 } = env1;
const skwrl = 𝔼.squirrel.create();

console.log(skwrl)
console.log(skwrl.position)
console.log(skwrl.velocity)

console.log(c1.id)
console.log(c1.next().id)