/* eslint-disable */
import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Routes from "./routes/package";

import Game from "./lib/Game";

export const GameObj = Game.CreateGame();
export const Context = React.createContext();

export function App() {
    const [ game, setGame ] = useState(GameObj);
    const [ data, setData ] = useState({ game });

    // useEffect(() => {
    //     function hook(...args) {
    //         if(this.type === "start") {
    //             setData({
    //                 ...data,
    //                 // canvas: game.render.canvas,
    //                 // stream: game.render.canvas.captureStream(24),
    //             });
    //         }
    //     };

    //     game.addSubscriber(hook);

    //     return () => game.removeSubscriber(hook);
    // }, [ data ]);

    return (
        <Router>
            <ScrollToTop>
                <Context.Provider value={ data }>
                    <Switch>                            
                        <Route path="/">
                            <Routes.Home />
                        </Route>
                    </Switch>
                </Context.Provider>
            </ScrollToTop>
        </Router>
    )
}

export default App;