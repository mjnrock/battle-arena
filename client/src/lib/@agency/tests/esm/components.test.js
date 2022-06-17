import Console from "../../util/Console";

import Component from "../../$lib/Component";
import Events from "../../$lib/Events";
import System from "../../$lib/System";
import Identity from "../../$lib/Identity";
import Entity from "../../$lib/Entity";
import Registry from "../../$lib/Registry";

Console.NewContext();

const comp = new Component({
	tags: ["tag1", "tag2"],
	state: {
		test: new Map([
			[ "buddhies", "blake" ],
			[ "kashiker", "kaleeko" ],
		]),
	},
});
Console.label("comp", comp)
comp.tags.add("tag3");
Console.hr();
Console.label("comp", comp)
Console.label(".recreate", comp.recreate());
Console.label(".copy", comp.copy());
// console.log(comp.next(comp))
// console.log(comp.next(comp, { id: true, tags: "cat" }))


// const events = new Events({
// 	name: "events",
// 	handlers: {
// 		test: (...args) => console.log(1234, ...args),
// 		test2: [
// 			(...args) => console.log(2345, ...args),
// 			(...args) => console.log(3456, ...args),
// 		],
// 	},
// 	tags: ["tag1", "tag2"],
// 	meows: 1,
// });
// console.log(events);
// console.log(events.recreate());
// console.log(events.copy());
// console.log(events._args);
// Console.hr();
// console.log(events.next());
// console.log(events.next({
// 	handlers: {
// 		test3: (...args) => console.log(1234, ...args),
// 	},
// }));
// console.log(events.delta());
// console.log(events.next(events, { id: true, tags: "cat" }));


// const entity = new Entity({}, {
// 	tags: ["tag1", "tag2"],
// }, {
// 	encoder: Registry.Encoders.InstanceOf(Entity),
// 	classifiers: [
// 		Registry.Classifiers.InstanceOf(Entity),
// 		Registry.Classifiers.Tagging(),
// 	],
// });
// console.log(entity);
// Console.hr();
// console.log(entity.recreate());
// Console.hr();
// console.log(entity.copy());
// console.log(entity.next());
// console.log(entity.delta());

// const registry = new Registry({
// 	Key: entity,
// 	Comp: new Component(),
// }, {
// 	encoder: Registry.Encoders.InstanceOf(Entity),
// 	classifiers: [
// 		Registry.Classifiers.InstanceOf(Entity),
// 		Registry.Classifiers.Tagging(),
// 	],
// });
// console.log(registry);
// Console.hr();
// console.log(registry.recreate());
// Console.hr();
// console.log(registry.copy());