/* eslint-disable */
import { useState } from "react";

import Kanvas from "./lib/Canvas";

import Canvas from "./Canvas";

function App() {
    const [ kanvas, setKanvas ] = useState(new Kanvas({ width: 500, height: 100, props: { fillStyle: "#F00", strokeStyle: "#000" } }));

    return (
        <>
            <Canvas
                canvas={ kanvas }
                onDraw={ function() {
                    this.rect(Math.random() * this.width, Math.random() * this.height, 50, 50, { isFilled: true });
                } }
            />
        </>
    )
}

export default App;