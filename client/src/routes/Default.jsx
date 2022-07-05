import { useContext } from "react";

import { Context } from "./../App";

import Entity from "../lib/ecs/Entity";
import System from "../lib/ecs/System";

const ent = new Entity({
	cats: [
		{
			name: "cat1",
		},
		{
			name: "cat2",
		},
	],
	bob: 1,
});

const system = new System({
	test: ({ entities, type, data }) => {
		console.log(11111, entities, type, data);
	},
});

system.invoke([ ent ], "test", Date.now());

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