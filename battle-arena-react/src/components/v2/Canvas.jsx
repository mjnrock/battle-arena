/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React,{ useEffect } from "react";

/**
 * Props
 * @canvas <Canvas>
 * @onDraw fn | Will be given @canvas as its scope
 */
function Canvas(props) {
    const { canvas, handlers = {}, ...rest } = props;

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

            ref.oncontextmenu = e => { e.preventDefault(); };
            if(typeof handlers.onMouseDown === "function") {
                ref.onmousedown = e => {
                    e.preventDefault();
                    handlers.onMouseDown(e.buttons, e.x, e.y)
                };
            }
            if(typeof handlers.onMouseUp === "function") {
                ref.onmouseup = e => {
                    e.preventDefault();
                    handlers.onMouseUp(e.buttons, e.x, e.y);
                }
            }
            if(typeof handlers.onClick === "function") {
                ref.onclick = e => {
                    e.preventDefault();
                    handlers.onClick(e.buttons, e.x, e.y);
                }
            }
            if(typeof handlers.onMouseMove === "function") {
                ref.onmousemove = e => {
                    e.preventDefault();
                    handlers.onMouseMove(e.buttons, e.x, e.y);
                }
            }

            // Overwrite the reference to attach canvas to React
            canvas.canvas = ref;
            
            //! DEBUG
            canvas.onDraw = () => canvas.gRect(Agency.Util.Dice.d25(1, -1), Agency.Util.Dice.d25(1, -1), 1, 1, { isFilled: true });

            canvas.start();
        }

        return () => {
            canvas.stop();
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