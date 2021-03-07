/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";
import { useBeacon } from "@lespantsfancy/agency/lib/react/package";

import Canvas from "./Canvas";
import { Context } from "./../../App";



export default function GameView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <Canvas
                canvas={ game.render }
            />
        </Segment>
    )
}