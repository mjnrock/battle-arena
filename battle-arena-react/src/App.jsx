/* eslint-disable */
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
                game,
            });
        };

        ctx.game.on("tick", fn)

        return () => {
            ctx.game.off("tick", fn);
        }
    }, []);

    return state;
};

function App() {
    return (
        <Context.Provider value={{ game: Game.$ }}>
            <Main />
        </Context.Provider>
    )
}

export default App;