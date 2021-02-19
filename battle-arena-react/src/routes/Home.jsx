/* eslint-disable */
import React from "react";

import { useGameContext, Context } from "./../App";
import Canvas from "./../components/Canvas";

export default function Home(props) {
    const game = useGameContext(Context);

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