/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React,{ useEffect } from "react";

import EventWatchable from "./../../lib/v2/util/EventWatchable";

/**
 * Props
 * @canvas <Canvas>
 * @drawAnimationFrame fn | Will be given @canvas as its scope
 */
function Canvas(props) {
    const { canvas, mouseHandler, ...rest } = props;

    const canvasRef = React.createRef();
    useEffect(() => {
        const ref = canvasRef.current;

        if(canvas && canvas.canvas !== ref) {
            // Copy all props from original canvas before overwriting the reference
            ref.width = canvas.width;
            ref.height = canvas.height;
            
            const ctx = ref.getContext("2d");
            for(let key in canvas.ctx) {
                const value = canvas.ctx[ key ];
                if(key !== "canvas" && typeof value !== "function" && ctx[ key ] !== value) {
                    ctx[ key ] = value;
                }
            }

            //NOTE  Presumably this gc's itself on @ref:@canvas.canvas destruction, but I haven't tested it
            canvas.__handler = new EventWatchable(ref, [
                "click",
                "contextmenu",
                "mousedown",
                "mouseup",
                "mousemove",
            ], {
                insertRef: true,
                middleware: {
                    contextmenu: e => e.preventDefault(),
                },
            });

            // Overwrite the reference to attach canvas to React
            canvas.canvas = ref;
        }
    }, []);

    return (
        <>
            <canvas
                ref={ canvasRef }
                { ...rest }
            />
        </>
    );
}

export default Canvas;