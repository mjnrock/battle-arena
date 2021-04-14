import React, { useContext } from "react";
import { Segment } from "semantic-ui-react";

import { Context } from "./../../App";
import Canvas from "./Canvas";
// import VideoStream from "./VideoStream";

export default function GameView() {
    const { game, stream } = useContext(Context);

    return (
        <Segment textAlign="center" inverted basic>
            <Canvas master={ game.render } />
            {/* <VideoStream stream={ stream } /> */}
        </Segment>
    )
}