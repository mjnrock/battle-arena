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
                <button onClick={ e => Game.$.dispatch("test", Date.now(), 123456) }>Click me!</button>
            </>
        );
    }

    return (
        <>
            <div>Ticks: { game.loop.ticks }</div>

            <Canvas
                canvas={ game.canvas }
            />
        </>
    )
}