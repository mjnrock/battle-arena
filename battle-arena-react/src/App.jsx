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

import Game from "./lib/v2/Game";
// import GridCanvas from "./lib/v2/GridCanvas";

// export const ctx = new Agency.Observable.Factory({
//     cats: 2,
//     map: new GridCanvas(25, 25, { width: 500, height: 500, props: { fillStyle: "rgba(0, 0, 255, 0.5)", strokeStyle: "#000" } }),
// }, false);
// export const ctx = new Agency.Context.Factory({
//     cats: 2,
// });
// export const ctx = new Agency.Store.Factory({
//     cats: 2,
// }, (state, prop, value) => {
//     return {
//         ...state,
//         [ prop ]: Number.isNaN(state[ prop ]) ? 0 : state[ prop ] + 1,
//     }
// });

export const Context = React.createContext(Game.$);

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