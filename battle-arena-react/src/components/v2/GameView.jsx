import React from "react";
import { Segment } from "semantic-ui-react";
// import { useWatchable } from "@lespantsfancy/agency/lib/react/package";
import { useWatchable } from "./package";

import Canvas from "./Canvas";
import { Context } from "./../../App";

export default function GameView() {
    const { data, subject: game } = useWatchable(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center" inverted basic>
            <Canvas canvas={ game.render } />
        </Segment>
    )
}