import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "./css/tachyons.min.css";
import "semantic-ui-css/semantic.min.css";
// import reportWebVitals from "./reportWebVitals";

import Agency from "@lespantsfancy/agency";
import { ToCanvasMap } from "./lib/v2/data/image/tessellator/grid";

Agency.Util.Base64.FileDecode("./assets/images/skwrl.txt")
.then(canvas => ToCanvasMap(32, 32, canvas, { asTessellation: true }))
.then(tessellation => {
    tessellation.relative(30)
        .add(`0.0`, 3)
        .add(`1.0`, 6);
        
    const sprite = tessellation.toSprite();

    console.log(sprite.get(0).toDataURL())
    console.log(sprite.get(100).toDataURL())
    console.log(sprite.get(200).toDataURL())
    console.log(sprite.get(300).toDataURL())
    console.log(sprite.get(400).toDataURL())
    console.log(sprite.find("1.0").toDataURL())
    console.log(sprite.find(1).toDataURL())
});

ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
