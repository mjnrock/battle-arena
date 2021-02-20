/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";
import { Segment } from "semantic-ui-react";

import { Context } from "../App";
import Game from "../lib/Game";
import Canvas from "./Canvas";

export default function GameView() {
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
        <Segment textAlign="center">            
            <Canvas
                canvas={ game.canvas }
                handlers={{
                    onMouseDown: (buttons, x, y) => Game.$.emit("input", "mousedown", buttons, game.canvas.pointToTile(x, y)),
                    onMouseUp: (buttons, x, y) => Game.$.emit("input", "mouseup", buttons, game.canvas.pointToTile(x, y)),
                    onClick: (buttons, x, y) => Game.$.emit("input", "click", buttons, game.canvas.pointToTile(x, y)),
                    onMouseMove: (buttons, x, y) => Game.$.emit("input", "mousemove", buttons, game.canvas.pointToTile(x, y)),
                }}
            />
        </Segment>
    )
}