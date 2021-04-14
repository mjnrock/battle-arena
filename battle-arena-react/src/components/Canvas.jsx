/* eslint-disable */
import React,{ useEffect, useRef } from "react";

export const MouseHandlers = (renderManager) => {
    const handler = e => renderManager.handler.$.emit(e.type, e);

    return {
        onClick: handler,
        onContextMenu: handler,
        onDoubleClick: handler,
        onDrag: handler,
        onDragEnd: handler,
        onDragEnter: handler,
        onDragExit: handler,
        onDragLeave: handler,
        onDragOver: handler,
        onDragStart: handler,
        onDrop: handler,
        onMouseDown: handler,
        onMouseEnter: handler,
        onMouseLeave: handler,
        onMouseMove: handler,
        onMouseOut: handler,
        onMouseOver: handler,
        onMouseUp: handler,
    };
};

/**
 * Props
 * @canvas <Canvas>
 * @drawAnimationFrame fn | Will be given @canvas as its scope
 */
export function Canvas({ master: renderManager, ...rest } = {}) {
    const canvasRef = useRef(renderManager.canvas);
    
    const draw = ctx => {
        if(renderManager.config.clearBeforeDraw) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        ctx.drawImage(renderManager.canvas, 0, 0);
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationFrameId;

        const render = () => {
            if(renderManager.canvas.width !== canvas.width || renderManager.canvas.height !== canvas.height) {
                canvas.width = renderManager.canvas.width;
                canvas.height = renderManager.canvas.height;
            }

            draw(ctx);
            animationFrameId = window.requestAnimationFrame(render);
        }
        render();
        
        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }
    }, [ draw ]);

    return (
        <canvas
            ref={ canvasRef }
            { ...MouseHandlers(renderManager) }
        />
    );
};

//? This one overwrites the master.canvas with the react ref
// function Canvas({ master, ...rest } = {}) {
//     const canvasRef = useRef(master.canvas);
    
//     useEffect(() => {
//         master.canvas = canvasRef.current; 
//     });

//     return (
//         <canvas
//             ref={ canvasRef }
//             onMouseDown={ e => console.log(master, e) }
//         />
//     );
// };

export default Canvas;