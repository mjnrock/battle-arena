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

export const ctx = new Agency.Context.Factory({
    cats: 2,
});
export const Context = React.createContext(ctx);

function App() {
    return (
        <Router>
            <ScrollToTop>
                <Context.Provider value={{
                    game: ctx,
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