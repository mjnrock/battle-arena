import React, { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Segment } from "semantic-ui-react";

import { Context } from "./../App";
// import Canvas from "./Canvas";
// import VideoStream from "./VideoStream";

function Canvas({ master, ...rest }) {
    const container = useRef(null);

    useEffect(() => {
        container.current.innerHTML = "";
        container.current.append(master.canvas);
    }, [ container, master.canvas ]);

    return (
        <div ref={ container } />
    )
}

export default function GameView() {
    const { game, stream } = useContext(Context);

    return (
        <Segment textAlign="center" inverted basic>
            <Canvas master={ game.render } />
            {/* <VideoStream stream={ stream } /> */}
        </Segment>
    )
}