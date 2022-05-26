import Console from "../util/Console";

import Agent from "../core/Agent";

Console.NewContext();

const agent = new Agent({
	state: {
		cats: 2,
	},
});