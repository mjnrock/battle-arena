import { useContext } from "react";

import { Context } from "./../App";

import Entity from "../lib/ecs/Entity";

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

ent.events.receive({
	type: "test",
	data: Date.now(),
});

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