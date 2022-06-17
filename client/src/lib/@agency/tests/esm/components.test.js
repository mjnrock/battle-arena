import Console from "../../util/Console";

import Events from "../../$lib/Events";
import System from "../../$lib/System";

Console.NewContext();

// const events = new Events({
// 	test: (...args) => console.log(1234, ...args),
// 	test2: [
// 		(...args) => console.log(2345, ...args),
// 		(...args) => console.log(3456, ...args),
// 	],
// })

// Console.label("comp", events);

// events.dispatch("test", [], Date.now());
// events.dispatch("test2", [], Date.now());

const system = new System({
	test: (...args) => console.log(1234, ...args),
	test2: [
		(...args) => console.log(2345, ...args),
		(...args) => console.log(3456, ...args),
	],
})

Console.label("system", system);

system.events.dispatch("test", [], Date.now());
system.events.dispatch("test2", [], Date.now());