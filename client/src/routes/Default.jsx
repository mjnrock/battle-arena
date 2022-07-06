import { useContext } from "react";

import { Context } from "./../App";

import Entity from "../lib/ecs/Entity";
import System from "../lib/ecs/System";
import Registry from "./../lib/Registry";

const [ ent, ent2 ] = Entity.Factory(2, {
	$eval: true,

	cats: [
		{
			name: "cat1",
		},
		{
			name: "cat2",
		},
	],
	kasheeka: {
		meows: true,
	},
	bob: () => Math.random(),
});

const reg = new Registry({
	p1: ent,
	p2: ent2,
});

const system = new System({
	test: ({ entities, type, data }) => {
		console.log(11111, entities, type, data);
	},
});

system.invoke(reg, "test", Date.now());

// console.log(ent.kasheeka)
// ent.update("kasheeka", {a:123}, true);
// console.log(ent.kasheeka)

for(let [ id, ent ] of reg) {
	console.log(ent.bob);
}

export default function Home() {
	const game = useContext(Context);

	return (
		<div>
			{
				game.id
			}
		</div>
	)
}