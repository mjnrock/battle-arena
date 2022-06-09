import Console from "../../util/Console";

import Struct from "../../core/ecs/Struct";
import Component from "./../../core/ecs/Component";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const struct = new Struct({
	fish: {
		name: "Bob",
	},
});

const comp = new Component("test", {
	dog: "woof",
	cat: [ 1, 2, 3, 4, 5, 6 ],
	cats: {
		kiszka: "meow",
		buddha: "rawr",
		meows: {
			yes: true,
			no: false,
		},
		cheese: new Map([
			[ "cheddar", "cheddars" ],
			[ "swiss", "swisses" ],
			[ "american", "americans" ],
		]),
	},
	fishes: struct,
}, {
	tags: [ "animals", "cats", "dogs" ],
});

console.log(comp)
Console.hr();
console.log(comp.toHierarchy())
// comp.args = [{ id: "test", tags: ["test"] }];
// console.log(comp.generator())