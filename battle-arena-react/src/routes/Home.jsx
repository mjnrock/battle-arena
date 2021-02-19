/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";

import { Context } from "./../App";
import Game from "./../lib/Game";
import Canvas from "./../components/Canvas";

export default function Home() {
    const game = useObserver(Context, "game");

    if(!Object.keys(game).length) {
        return (
            <>
                {/*//* Dispatch Example */}
                <button onClick={ e => Game.$.dispatch("test", Date.now(), 123456) }>Dispatch</button>
            </>
        );
    }

    return (
        <>
            <div>Ticks: { game.loop.ticks }</div>

            <Canvas
                canvas={ game.canvas }
            />
            
            <button onClick={ e => Game.$.dispatch("test", Date.now(), 123456) }>Dispatch</button>
        </>
    )
}