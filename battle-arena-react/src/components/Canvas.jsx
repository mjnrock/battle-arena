/* eslint-disable */
import React, { Fragment, useEffect, useRef } from "react";

export function Canvas({ master, ...rest }) {
    const container = useRef(null);

    useEffect(() => {
        container.current.innerHTML = "";
        container.current.append(master.canvas);
    }, [ container, master.canvas ]);

    return (
        <Fragment ref={ container } />
    )
}

export default Canvas;