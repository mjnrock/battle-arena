/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";
import { useObserver } from "@lespantsfancy/agency/lib/react";

import Canvas from "./Canvas";
import { Context } from "./../../App";

export default function GameView() {
    const [ data, game ] = useObserver(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <Canvas
                canvas={ game.map }
            />
        </Segment>
    )
}