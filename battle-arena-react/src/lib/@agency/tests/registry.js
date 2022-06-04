import Console from "../util/Console";

import Registry from "./../core/Registry";
import Agent from "./../core/Agent";

Console.NewContext();

const [ a1, a2, a3 ] = Agent.Factory(3, {
	state: {},
});
const registry = new Registry();
const registry2 = new Registry();

registry.registerWithAlias(a1, "a1");
registry.registerWithAlias(a2, "a2");
registry.registerWithAlias(registry2, "r2");
registry.registerWithAlias(12345, "num");
registry2.registerWithAlias(a1, "AONE");
registry.setPool("test", a1.id, a2.id);
registry.setPool("test2", a1.id, a2.id);
registry.setPool("test3", a1.id);

console.log(registry.size);
console.log(registry.sizeAlias);
console.log(registry.sizePools);
console.log(registry.r2.AONE.id);
console.log(registry.num);
console.log(registry.ids);
console.log(registry.aliases);
console.log(registry.pools);

// console.log(registry.get("a1").id);
// console.log(registry.a1.id);

// console.log(registry.getPool("test"));
// console.log(registry.getPool("test").map(a => a.id));

// console.log(Array.from(registry.union("test", "test2", "test3")).length);			// Assert:	2
// console.log(Array.from(registry.intersection("test", "test2", "test3")).length);	// Assert:	1
// console.log(registry.test3)

// console.log(registry.getEntryValue("test").length);
// registry.addToPool("test", a3.id);
// registry.addToPool("test", a3.id);
// registry.addToPool("test", a3.id);
// console.log(registry.getEntryValue("test").length);