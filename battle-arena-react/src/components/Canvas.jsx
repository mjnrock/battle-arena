/* eslint-disable */
import React,{ useEffect } from "react";

/**
 * Props
 * @canvas <Canvas>
 * @onDraw fn | Will be given @canvas as its scope
 */
function Canvas(props) {
    const { canvas, ...rest } = props;

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
            if(typeof props.handlers.onMouseDown === "function") {
                ref.onmousedown = e => {
                    e.preventDefault();
                    props.handlers.onMouseDown(e.buttons, e.x, e.y)
                };
            }
            if(typeof props.handlers.onMouseUp === "function") {
                ref.onmouseup = e => {
                    e.preventDefault();
                    props.handlers.onMouseUp(e.buttons, e.x, e.y);
                }
            }
            if(typeof props.handlers.onClick === "function") {
                ref.onclick = e => {
                    e.preventDefault();
                    props.handlers.onClick(e.buttons, e.x, e.y);
                }
            }
            if(typeof props.handlers.onMouseMove === "function") {
                ref.onmousemove = e => {
                    e.preventDefault();
                    props.handlers.onMouseMove(e.buttons, e.x, e.y);
                }
            }

            // Overwrite the reference to attach canvas to React
            canvas.canvas = ref;
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