/* eslint-disable */
import React,{ useEffect, useState } from "react";

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

        if(canvas.canvas !== ref) {
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
            <canvas ref={ canvasRef } { ...rest } />
        </>
    );
}

export default Canvas;