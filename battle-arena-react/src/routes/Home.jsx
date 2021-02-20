/* eslint-disable */
import { useObserver } from "@lespantsfancy/agency/lib/react";
import React from "react";

import { Context } from "./../App";
import Game from "./../lib/Game";
import Canvas from "./../components/Canvas";
import { validate } from "uuid";

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
            <div>[ X, Y ]: { game.entities.player.components.position.x }, { game.entities.player.components.position.y }</div>
            {
                Object.entries(game.entities.player.components.attributes.state).map(([ key, value ]) => {
                    if(validate(key)) {
                        return null;
                    }

                    if(typeof value === "object") {
                        return (
                            <div>{ key }: { game.entities.player.components.attributes[ key ].current } / { game.entities.player.components.attributes[ key ].max }</div>
                        );
                    }

                    return (
                        <div>{ key }: { game.entities.player.components.attributes[ key ] }</div>
                    )
                }).filter(v => v !== null)
            }
            

            <Canvas
                canvas={ game.canvas }
            />
            
            <button onClick={ e => Game.$.dispatch("test", Date.now(), 123456) }>Dispatch</button>
        </>
    )
}