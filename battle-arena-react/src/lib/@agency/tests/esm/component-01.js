import Console from "../../util/Console";

import Component from "./../../core/ecs/Component";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const comp = new Component();

console.log(comp)
comp._args = [{ id: "test", tags: ["test"] }];
console.log(comp._generator())