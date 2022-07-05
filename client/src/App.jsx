import { v4 as uuid } from "uuid";
import Relay from "@lespantsfancy/relay";

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Router from "./routes/package";

import GameBase from "./lib/Game";

export const Game = {
	id: uuid(),
	game: new GameBase(),
};
export const Context = React.createContext();

console.log(Game)

export function App() {
	const [ game, setGame ] = useState(Game);

	return (		
		<Context.Provider value={ game }>
			<Routes>
				<Route path="/game" element={ <Router.Default /> } />
			</Routes>
		</Context.Provider>
	);
}

export default App;