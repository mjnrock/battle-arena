/* eslint-disable */
import React,{ useEffect } from "react";

/**
 * Props
 * @canvas <Canvas>
 * @onDraw fn | Will be given @canvas as its scope
 */
function Canvas(props) {    
    function draw(kanvas) {
        kanvas.draw(props.onDraw);

        requestAnimationFrame((...args) => draw(props.canvas));
    }

    const canvasRef = React.createRef();
    useEffect(() => {
        const ref = canvasRef.current;

        if(props.canvas.canvas !== ref) {
            // Copy all props from original canvas before overwriting the reference
            console.log(props.canvas.width, props.canvas.height);
            ref.width = props.canvas.width;
            ref.height = props.canvas.height;
            
            const ctx = ref.getContext("2d");
            for(let key in props.canvas.ctx) {
                const value = props.canvas.ctx[ key ];
                if(key !== "canvas" && typeof value !== "function" && ctx[ key ] !== value) {
                    ctx[ key ] = value;
                }
            }

            // Overwrite the reference to attach canvas to React
            props.canvas.canvas = ref;

            if(typeof props.onDraw === "function") {
                requestAnimationFrame((...args) => draw(props.canvas));
            }
        }
    }, []);

    return (
        <canvas ref={ canvasRef } />
    );
}

export default Canvas;