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

const manager = new Manager({}, `physics`, [ a1, a2 ]);
// const manager = new Manager({}, Position.Nomen, [ a1, a2 ]);

// console.log(a1.position)
// console.log(a2.position)
// a1.trigger("cat", Date.now())

console.log(manager)
