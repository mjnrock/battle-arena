/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React,{ useEffect } from "react";

import EventObservable from "./EventObservable";

/**
 * Props
 * @canvas <Canvas>
 * @onDraw fn | Will be given @canvas as its scope
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

            if(typeof mouseHandler === "function") {
                //NOTE  Presumably this gc's itself on @ref:@canvas.canvas destruction, but I haven't tested it
                EventObservable.SubjectFactory(ref, [
                    "click",
                    "contextmenu",
                    "mousedown",
                    "mouseup",
                    "mousemove",
                ], {
                    insertRef: true,
                    next: (type, { data }) => {
                        const [ e ] = data;
                        if(type === "click") {
                            mouseHandler("click", ref, e.buttons, e.x, e.y);
                        } else if(type === "contextmenu") {
                            e.preventDefault();
                        }
                    },
                });
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