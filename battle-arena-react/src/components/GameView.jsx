import React, { useContext, useEffect } from "react";
import { Segment } from "semantic-ui-react";

import { Context } from "./../App";
import Canvas from "./Canvas";

export default function GameView() {
    const { game } = useContext(Context);

	useEffect(() => {
		console.log(game)
	}, []);

    return (
        <Segment textAlign="center" inverted basic>
			Canvas Stub<br />
			Game needs to have a Master Render Canvas before this will display correctly
            {/* <Canvas master={ game.render } /> */}
        </Segment>
    )
}