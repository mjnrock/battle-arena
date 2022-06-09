import Console from "../../util/Console";

import Component from "../../core/ecs/Component";
import Entity from "../../core/ecs/Entity";
import System from "../../core/ecs/System";
import Agent from "../../core/Agent";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const comp = new Component("test");

const [ e1, e2, e3 ] = Entity.Factory(
	3,
	[ [ comp, ], {} ],
	(i, e) => Console.label(`e${ i + 1 }`, e.id),
);

const [ s1 ] = System.Factory(1, {
	state: {
		$eval: true,
		cats: () => Math.random() * 100,
	},
	events: {
		test: (state, entities, ...args) => {
			// Console.label("test", state, entities.map(e => e.id), ...args);
		},
	},
	hooks: {
		[ Agent.Hooks.EFFECT ]: () => console.log("EFFECT"),
		[ Agent.Hooks.UPDATE ]: () => console.log("UPDATE"),
	}
},
	(i, s) => Console.label(`s${ i + 1 }`, s.id),
);

Console.hr();

// Console.label("system", system.id);
// console.log(system);

//? State should NOT change
console.log(s1.state)
s1.dispatch("test", [ e1, e2 ], Date.now());
console.log(s1.state)

Console.hr();

//? State SHOULD change
s1.addHandler("test", () => ({
	meows: Infinity,
}));
s1.dispatch("test", [ e1, e2 ], Date.now());
console.log(s1.state)

Console.hr();