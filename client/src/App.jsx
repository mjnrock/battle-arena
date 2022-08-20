import React from "react";
import { Routes, Route } from "react-router-dom";

// import Router from "./routes/package";
import { GameRoute } from "./routes/Game";
import { Test as TestRoute } from "./routes/Test";

import "./assets/css/reset.css";
import "./assets/css/main.css";

/**
 * ! IMPORTANT !
 * Future Matt, you should **really** consider starting from scratch and refamiliarize yourself with
 * the Entity, Component, and System architecture herein.  Also look at the `composables` folder, and
 * the utility concepts like `Registry`, `Identity`, and `MapSet`.
 */

export function App() {
	return (
		<Routes>
			<Route path="/game" element={ <GameRoute /> } />
			<Route path="/test" element={ <TestRoute /> } />
			
			{/* <Route path="*" element={ <Router.Default /> } /> */}
		</Routes>
	);
}

export default App;











// <GameRoute />
// <Context.Provider value={ game }>
// 	<Routes>
// 		<Route path="/game" element={ <GameRoute /> } />
// 		{/* <Route path="/test" element={ <Router.Test /> } /> */}
	
// 		{/* <Route path="*" element={ <Router.Default /> } /> */}
// 	</Routes>
// </Context.Provider>