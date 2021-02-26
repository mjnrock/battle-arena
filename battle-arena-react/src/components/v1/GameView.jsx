/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";
import { Segment } from "semantic-ui-react";

import { Context } from "../../App";
import Game from "../lib/Game";
import MouseManager from "../lib/manager/MouseManager";
import Canvas from "../v2/Canvas";

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
            <div>[ X, Y ]: { game.entities.player.components.position.x }, { game.entities.player.components.position.y }</div>
            
            <Canvas
                canvas={ game.canvas }
                handlers={{
                    onMouseDown: (buttons, x, y) => MouseManager.$.emit("mouse", "down", buttons, game.canvas.pointToTile(x, y)),
                    onMouseUp: (buttons, x, y) => MouseManager.$.emit("mouse", "up", buttons, game.canvas.pointToTile(x, y)),
                    onClick: (buttons, x, y) => MouseManager.$.emit("mouse", "click", buttons, game.canvas.pointToTile(x, y)),
                    onMouseMove: (buttons, x, y) => MouseManager.$.emit("mouse", "move", buttons, game.canvas.pointToTile(x, y)),
                }}
            />
        </Segment>
    )
}