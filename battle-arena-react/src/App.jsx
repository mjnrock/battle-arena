/* eslint-disable */
import { useEffect, useState } from "react";
import { Segment } from "semantic-ui-react";

import Lib from "./lib/package";

import Canvas from "./Canvas";

const state = {
    canvas: new Lib.GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
};

function App() {
    const [ kanvas, setKanvas ] = useState(state.canvas);
    const [ cursor, setCursor ] = useState([ 0, 0 ]);

    useEffect(() => {
        kanvas.onDraw = function() {
            this.drawGrid();

            const { tx, ty } = this.pointToTile(...cursor);
            this.gRect(~~tx, ~~ty, 1, 1, { isFilled: true });
        };
    }, [ cursor ]);

    useEffect(() => {
        console.log("App.Update");
    });

    const { tx, ty } = kanvas.pointToTile(...cursor);
    return (
        <Segment textAlign="center">
            <Segment>
                <div>[TILE]: { ~~tx },{ ~~ty }</div>
                <div>[CURSOR]: { cursor.toString() }</div>
            </Segment>

            <Canvas
                canvas={ kanvas }
                onClick={ e => setCursor([ e.clientX, e.clientY ])}
            />
        </Segment>
    )
}

export default App;