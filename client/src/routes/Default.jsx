import { useContext } from "react";

import { Context } from "./../App";

export default function Home() {
	const { id, game } = useContext(Context);

	console.log(game)
	console.log(game.realm)
	console.log(game.realm.overworld)
	console.log(game.realm.overworld.nodes)
	console.log(game.realm.overworld.nodes[ "1,1" ]);
	console.log(game.realm.overworld.entities)

	return (
		<div>
			{
				game.id
			}
		</div>
	)
}