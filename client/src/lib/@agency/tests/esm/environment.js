import Console from "../../util/Console";

import System from "../../$next/ecs/System";
import Entity from "../../$next/ecs/Entity";
import Component from "../../$next/ecs/Component";
import Environment from "./../../$next/ecs/Environment";

Console.NewContext();

const s1 = new System();
const c1 = new Component("test");
const e1 = new Entity([
	c1,
]);

const env1 = new Environment({
	instances: [ s1, e1, c1 ],
});

console.log(env1.instances.Systems);
Console.hr();
console.log(env1.instances[ `@System` ]);