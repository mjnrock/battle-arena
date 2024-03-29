import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
// import ThreeCanvas from "./ThreeCanvas";
import PixiCanvas from "./PixiCanvas";

import "./assets/css/tachyons.min.css";
import "semantic-ui-css/semantic.min.css";
import "./assets/css/main.css";
// import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
    <React.StrictMode>
        {/* <ThreeCanvas /> */}
        <PixiCanvas />
    </React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();