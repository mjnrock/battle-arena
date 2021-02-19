/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";

import { Context } from "./../App";
import Canvas from "./../components/Canvas";

export default function Home(props) {
    const game = useObserver(Context, "game");

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