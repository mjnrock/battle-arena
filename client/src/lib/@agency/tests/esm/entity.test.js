import Console from "../../util/Console";

import Component from "../../$lib/Component";
import Entity from "../../$lib/Entity";

Console.NewContext();

const ent = new Entity({
	test: new Component(),
	test2: new Component(),
});

// Console.label("entity", ent);
// Console.label("test", ent.test);
// Console.label("test2", ent.test2);

ent.send(ent.test, {
	namespace: "testing",
	event: "test",
	data: "DaTa",
});