// import Agency from "@lespantsfancy/agency";
import Agency from "./../../lib/v2/util/agency/package";
import React,{ useEffect } from "react";

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

            //FIXME Refactor and move to the "canvas" handler in RenderManager
            canvas.__handler = new Agency.EventWatchable(ref, [
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
    }, [ canvas, canvasRef ]);

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