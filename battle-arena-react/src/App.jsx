/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Routes from "./routes/package";

import Game from "./lib/Game";

export const Context = React.createContext(Game.$);

Game.$.addReducer("test", (state, msg, ...args) => {
    console.log(msg, ...args);

    const sturt = {
        ...state,
        now: Date.now(),
    };

    return sturt;
});

function App() {
    return (
        <Router>
            <ScrollToTop>
                <Context.Provider value={{
                    game: Game.$,
                }}>
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