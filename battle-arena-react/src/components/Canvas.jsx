/* eslint-disable */
import React, { useEffect, useRef } from "react";

export function Canvas({ master }) {
    const container = useRef(null);

    useEffect(() => {
        container.current.innerHTML = "";
        container.current.append(master.canvas);
    }, [ container, master.canvas ]);

    return (
        <div
            className="unset-all"
            ref={ container }
        />
    )
}

export default Canvas;