/* eslint-disable */
import React from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Routes from "./routes/package";

import Game from "./lib/v2/Game";

export const Context = React.createContext(Game._);

function App() {
    return (
        <Router>
            <ScrollToTop>
                <Context.Provider value={{
                    game: Game._,
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