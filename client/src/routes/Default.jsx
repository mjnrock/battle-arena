import { useContext } from "react";

import { Context } from "./../App";

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