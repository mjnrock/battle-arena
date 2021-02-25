/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";
import { useObserver } from "@lespantsfancy/agency/lib/react";

import { Context } from "./../../App";

export default function GameView() {
    const [ data, game ] = useObserver(Context, "game");
    
    if(Object.keys(game || {}).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <div>Cats: { data.cats }</div>
            <div>Dogs: { data.dogs }</div>

            <button
                onClick={ e => {
                    game.cats += 1;
                    // game.dispatch("cats", 1);
                } }
            >Click</button>
        </Segment>
    )
}