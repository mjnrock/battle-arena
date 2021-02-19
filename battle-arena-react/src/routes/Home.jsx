/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";

import { Context } from "./../App";
import Canvas from "./../components/Canvas";

export default function Home() {
    const game = useObserver(Context, "game");
    console.log(game)

    if(!Object.keys(game).length) {
        return null;
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