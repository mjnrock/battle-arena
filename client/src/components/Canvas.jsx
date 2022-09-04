import React, { useEffect, useRef } from "react";

export function Canvas({ canvas }) {
    const container = useRef(null);

    useEffect(() => {
        container.current.innerHTML = "";
        container.current.append(canvas);
    }, [ container, canvas ]);

    return (
        <div
            className="unset-all"
            ref={ container }
        />
    )
}

export default Canvas;