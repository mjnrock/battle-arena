import Console from "../../util/Console";

import Struct from "../../core/ecs/Struct";

Console.NewContext("This test suite is designed to test the Struct class and its hooks.");

const struct = new Struct({
	cats: 6,
	struct2: new Struct({
		nested: {
			dogs: 2,
		},
	}),
});

console.log(struct);

struct._hooks[ Struct.Hooks.VIEW ].add((target, prop, value) => {
	Console.labelTime(`view`, prop, value);

	// if(prop === "cats") {
	// 	return Infinity;
	// }

	return Infinity;
});
struct._hooks[ Struct.Hooks.REDUCER ].add((target, prop, next, current) => {
	Console.label(`reducer`, prop, next);

	return 9;
});
struct._hooks[ Struct.Hooks.EFFECT ].add((target, prop, current) => {
	Console.label(`effect`, prop, current);
});
struct._hooks[ Struct.Hooks.DELETE ].add((target, prop) => {
	Console.label(`delete`, prop);
});

Console.section("Hooks");
// console.log(Reflect.getOwnPropertyDescriptor(struct, "cats"));
// console.log(struct.hasOwnProperty(Symbol(Symbol.toStringTag)));
// console.log(struct);
// console.log(struct.cats);	// Assert: Infinity (from VIEW)
// Console.hr();
struct.cats = 14;
// console.log(struct);
// console.log(struct.cats);	// Assert: 9 (from REDUCER)

// console.log(struct._hooks[ Struct.Hooks.REDUCER ]);

delete struct.struct2;
console.log(struct)

Console.section("Iteration");
for(let [ key, value ] of struct) {
	console.log(key, value);	// Assert: Infinity (from VIEW)
}