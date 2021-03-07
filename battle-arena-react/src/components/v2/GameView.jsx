/* eslint-disable */
import React from "react";
import { Segment } from "semantic-ui-react";
import { useBeacon } from "@lespantsfancy/agency/lib/react/package";

import Canvas from "./Canvas";
import { Context } from "./../../App";



export default function GameView() {
    const { data, beacon: game } = useBeacon(Context, "game");
    
    if(Object.keys(data).length === 0) {
        return null;
    }

    return (
        <Segment textAlign="center">
            <Canvas
                canvas={ game.render }
                mouseHandler={ (type, canvas, buttons, x, y) => {
                    if(type === "click") {
                        const { left, top } = canvas.getBoundingClientRect();
                        const pos = {
                            px: x - left,
                            py: y - top,
                        };
                        pos.tx = pos.px / 32;
                        pos.ty = pos.py / 32;
                        pos.txi = Math.floor(pos.tx);
                        pos.tyi = Math.floor(pos.ty);

                        const ent = game.world.entities.select(e => e.position.x === pos.txi && e.position.y === pos.tyi).map(e => e.toData());
                        console.info(pos.txi, pos.tyi, ent.length, ...ent);

                        console.log(game.world.getNode(pos.txi, pos.tyi));
                    }
                }}
            />
        </Segment>
    )
}