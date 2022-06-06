import Console from "../../util/Console";

import Struct from "./../../core/ecs/Struct";

Console.NewContext("This test suite is designed to test the Struct class and its behavior.");

const struct = new Struct({
	cats: 2,
	struct2: new Struct({
		nested: {
			dogs: -2,
		},
	}),
});

// console.log(struct);

//? Serialization tests
// console.log(struct.toString());
// console.log(struct.toJson());
// console.log(struct.toObject());
// console.log(struct.toArray());
// console.log(struct.toHierarchy());

//? CRUD tests
// console.log(struct);
// struct.upsert("struct3", new Struct());
// console.log(struct);
// struct.remove("struct3")
// console.log(struct);
// console.log(struct.find("struct2"));
// console.log(struct.find(/struct2/ig));
// console.log(struct.find(() => true));