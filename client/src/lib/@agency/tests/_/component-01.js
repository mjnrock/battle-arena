import Console from "../../util/Console";

import Registry from "../../core/Registry";
import Struct from "../../core/ecs/Struct";
import Component from "./../../core/ecs/Component";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const struct = new Struct({
	fish: {
		name: "Bob",
	},
});

const registry = new Registry([
	struct,
]);

const comp = new Component("test", {
	dog: 654,									// Number test
	cat: [ 1, 2, 3, 4, 5, 6 ],					// Array test
	cats: {										// Object test
		kiszka: "meow",							// String test
		buddha: "rawr",
		meows: {								// Nested Object test
			yes: true,							// Boolean test
			no: false,
			miaos: [ -1, -2, -3 ]				// Nested Array test
		},
		cheese: new Map([						// Map test
			[ "cheddar", "cheddars" ],
			[ "swiss", "swisses" ],
			[ "american", "americans" ],
		]),
	},
	fishes: registry,							// AgencyBase test
}, {
	tags: [ "animals", "cats", "dogs" ],		// Set test
});

console.log(comp)
Console.hr();
console.log(comp.toHierarchy())
// comp.args = [{ id: "test", tags: ["test"] }];
// console.log(comp.generator())