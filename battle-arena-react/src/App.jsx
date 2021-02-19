/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React, { useState, useEffect, useContext } from "react";
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from "react-router-dom";

import ScrollToTop from "./ScrollToTop";
import Routes from "./routes/package";

import Game from "./lib/Game";

export const Context = React.createContext(Game.$);

export function useGameContext(context) {
    const ctx = useContext(context);
    const [ state, setState ] = useState({});

    useEffect(() => {
        const fn = function(game) {
            setState({
                ...game
            });
        };

        let obs = new Agency.Observer(ctx.game, fn);

        return () => {
            obs.unwatch(ctx.game);
            obs = null;
        }
    }, []);

    return state;
};

const ctx = {
    game: Game.$,
};

function App() {
    return (
        <Router>
            <ScrollToTop>
                <Context.Provider value={ ctx }>
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