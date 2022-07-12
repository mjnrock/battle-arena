import { v4 as uuid } from "uuid";

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Router from "./routes/package";

import GameBase from "./game/Game";

import "./assets/css/reset.css";

export const Game = {
	id: uuid(),
	game: new GameBase(),
};
export const Context = React.createContext();

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