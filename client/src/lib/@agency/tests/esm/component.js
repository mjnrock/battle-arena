import Console from "../../util/Console";

import Component from "./../../$lib/Component";

Console.NewContext();

const comp = new Component("kets", {
	meows: Infinity,
	meow() {
		console.log("MEOOOOOWWWW");
	},
});
console.log(comp);
comp.meow();
console.log(comp.next({
	dags: "werf",
}));
console.log(comp.delta({
	dags: "werfs",
}));