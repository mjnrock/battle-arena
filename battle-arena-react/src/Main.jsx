/* eslint-disable */
import React from "react";

import { useGameContext, Context } from "./App";
import Canvas from "./components/Canvas";

function Main() {
    const { game } = useGameContext(Context);

    if(!game) {
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

export default Main;