import Console from "../util/Console";

import Registry from "./../core/Registry";
import Agent from "./../core/Agent";

Console.NewContext();

const [ a1, a2 ] = Agent.Factory(2, {
	state: {},
});
const registry = new Registry([ a1, a2 ]);

registry.registerWithAlias(a1, "a1");
registry.registerWithAlias(a2, "a2");
registry.setPool("test", a1.id, a2.id);
registry.setPool("test2", a1.id, a2.id);
registry.setPool("test3", a1.id);

// console.log(registry);

// console.log(registry.get("a1").id);
// console.log(registry.a1.id);

// console.log(registry.getPool("test"));
// console.log(registry.getPool("test").map(a => a.id));

console.log(Array.from(registry.union("test", "test2", "test3")).length);			// Assert:	2
console.log(Array.from(registry.intersection("test", "test2", "test3")).length);	// Assert:	1

console.log(registry.test3)