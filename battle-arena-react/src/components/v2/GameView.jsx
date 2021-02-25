/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React, { useState, useEffect, useContext } from "react";
import { Segment } from "semantic-ui-react";

import { Context } from "./../../App";
import { useObserver } from "@lespantsfancy/agency/lib/react";

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

                    console.log(game, data);
                } }
            >Click</button>
        </Segment>
    )
}