import Console from "../util/Console";

import Struct from "./../core/ecs/Struct";

Console.NewContext();

const s1 = new Struct({
	cats: 2,
});
const s2 = new Struct({
	cats: 4,
	struct: s1,
	struct2: s1,
});
const s3 = new Struct({
	cats: 8,
	dogs: s2,
});

// console.log(s1);

//? Iteratability test
// for(let s of s1) {
// 	console.log(s);
// }

console.log(s2);
// console.log(s2.toArray());
// console.log(s2.toObject());
// console.log(s2.toString());
// console.log(s2.toJson());
// console.log(Struct.FromJson(s2.toString()));
// console.log(Struct.FromJson(s2.toJson()));
// console.log(Struct.FromObject(s2.toArray()));

Console.hr();
console.log(s3.toHierarchy());
console.log(Struct.FromHierarchy(s3.toHierarchy()));