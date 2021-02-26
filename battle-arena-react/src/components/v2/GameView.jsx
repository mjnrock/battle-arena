/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";
import { useBeacon } from "@lespantsfancy/agency/lib/react";

import Canvas from "./Canvas";
import { Context } from "./../../App";

export default function GameView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    // console.log(data)
    // console.log(game)

    return (
        <Segment textAlign="center">
            <div>{ data.cats }</div>
            
            <Canvas
                canvas={ game.canvas }
            />
        </Segment>
    )
}