import Console from "../../util/Console";

import Struct from "../../core/ecs/Struct";

Console.NewContext("This test suite is designed to test the Struct class and its hooks.");

const struct = new Struct({
	cats: 2,
	struct2: new Struct({
		nested: {
			dogs: -2,
		},
	}),
});

console.log(struct);