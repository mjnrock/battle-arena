import Console from "./../@agency/util/Console";

import Agent from "../@agency/core/Agent";
import Entity from "../@agency/core/ecs/Entity";
import Animus from "../world/Animus";
import Manager from "./../manager/Manager";

import "./../data/ecs/component/seed";
import "./../data/ecs/entity/seed";

Console.NewContext();

const [ a1, a2 ] = Animus.Factory(2, [[], {
	triggers: [
		[ "cat", [
			(state, ...args) => {
				console.log(1111, state, ...args);
			},
		] ],
	],
}]);

const manager = new Manager({}, "physics", [ a1, a2 ]);

// console.log(a1)
// console.log(a2)
// console.log(manager)

a1.trigger("cat", Date.now())