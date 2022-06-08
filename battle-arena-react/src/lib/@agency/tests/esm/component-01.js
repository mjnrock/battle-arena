import Console from "../../util/Console";

import Component from "./../../core/ecs/Component";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

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
	},
}, {
	tags: [ "animals", "cats", "dogs" ],
});

console.log(comp)
Console.hr();
console.log(comp.toHierarchy())
// comp.args = [{ id: "test", tags: ["test"] }];
// console.log(comp.generator())