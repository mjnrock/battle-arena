import React, { useRef } from "react";
import { Segment } from "semantic-ui-react";
// import { useWatchable } from "@lespantsfancy/agency/lib/react/package";
import { useWatchable } from "./package";

import Canvas from "./Canvas";
import { Context } from "./../../App";

export default function GameView() {
    // const ctx = useContext(Context);
    // console.log(ctx)
    const { data, subject: game } = useWatchable(Context, "game");
    // const videoRef = useRef(game.render._canvas);
    
    console.log(849237948237498)
    if(Object.keys(data).length === 0) {
        return null;
    }

    // console.log(videoRef)
    // if(videoRef.current) {
    //     videoRef.current.srcObject = game.render._canvas.captureStream(24);
    // }

    return (
        <Segment textAlign="center" inverted basic>
            <Canvas canvas={ game.render } />
            {/* <Canvas canvas={ game.world.overworld.videoSource } />

            <video ref={ videoRef } controls muted autoPlay>
                <source type="video/mp4"></source>
            </video> */}
            {/* <video controls muted autoPlay>
                <source src={ game.world.overworld.videoSource.video.captureStream() } type="video/mp4"></source>
            </video> */}
        </Segment>
    )
}