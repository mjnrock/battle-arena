/* eslint-disable */
import { useState, useEffect } from "react";
import { Button } from "semantic-ui-react";

import Kanvas from "./lib/Canvas";

import Canvas from "./Canvas";

function App() {
    const [ kanvas, setKanvas ] = useState(new Kanvas({ width: 500, height: 100, props: { fillStyle: "#999", strokeStyle: "#000" } }));
    const [ animate, setAnimate ] = useState(true);

    useEffect(() => {        
        kanvas.draw((_this) => {
            _this.rect(Math.random() * 100, Math.random() * 100, 50, 50, { isFilled: true });
        });
    }, []);

    return (
        <>
            <Canvas canvas={ kanvas } animate={ animate } />
        </>
    )
}

export default App;