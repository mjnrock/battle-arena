import Console from "../../util/Console";

import Component from "../../$lib/Component";

Console.NewContext();

const comp = new Component("kets", {
	meows: Infinity,
	meow() {
		Console.label(".meow", "MEOOOOOWWWW");
	},
});


Console.label("comp", comp);


//? Verify that the basics of the Component class work as expected.
comp.meow();
Console.label(".next", comp.next({
	dags: "werf",
}));
Console.label(".delta", comp.delta({
	dags: "werfs",
}));