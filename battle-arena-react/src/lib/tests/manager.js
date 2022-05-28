import Console from "./../@agency/util/Console";

import Agent from "../@agency/core/Agent";
import Entity from "../@agency/core/ecs/Entity";
import Animus from "../world/Animus";
import Manager from "./../manager/Manager";

import seedComponents from "./../data/ecs/component/seed";
import seedEntities from "./../data/ecs/entity/seed";
import Position from "../data/ecs/struct/Position";

Console.NewContext();

seedComponents();
seedEntities();

const [ a1, a2 ] = Animus.Factory(2, [[], {
	triggers: [
		[ "cat", [
			(state, ...args) => {
				console.log(1111, state, ...args);
			},
		] ],
	],
}]);
console.log(`[Animus 1:]`, a1.id);
console.log(`[Animus 2:]`, a2.id);

const manager = new Manager({}, [ a1, a2 ]);
console.log(`[Manager:]`, manager.id);
// console.log(manager)

// a1.trigger("cat", Date.now());
// a2.trigger("cat", Date.now());

manager.trigger("cat", Date.now());	// Should fire for a1 and a2

for(let a of manager) {
	console.log(a.id);
}