import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

import "./css/tachyons.min.css";
import "semantic-ui-css/semantic.min.css";
// import reportWebVitals from "./reportWebVitals";

import Agency from "@lespantsfancy/agency";
import { ToGrid } from "./lib/v2/data/image/tessellator/grid";
import Tessellation from "./lib/v2/util/render/Tessellation";

Agency.Util.Base64.FileDecode("./assets/images/skwrl.txt").then(canvas => ToGrid(32, 32, canvas, { asJson: true })).then(data => {
    const tessellation = new Tessellation(data);

    tessellation.relative(30)
        .add(`0.0`, 3)
        .add(`1.0`, 6);

    console.log(...tessellation.score());

    const sequence = tessellation.toSequence();

    console.log(sequence.getKey(100));
    console.log(sequence.getKey(220));
    console.log(sequence.getKey(401));
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
