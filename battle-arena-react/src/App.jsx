/* eslint-disable */
import Agency from "@lespantsfancy/agency";
import React, { useState, useEffect, useContext } from "react";

import Game from "./lib/Game";
import Main from "./Main";

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
        <Context.Provider value={ ctx }>
            <Main />
        </Context.Provider>
    )
}

export default App;