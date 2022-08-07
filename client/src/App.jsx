import React from "react";
import { Routes, Route } from "react-router-dom";

// import Router from "./routes/package";
import { GameRoute } from "./routes/Game";

import "./assets/css/reset.css";
import "./assets/css/main.css";

//FIXME: Currently if there are multiple Game instances, the event handlers won't figure correctly

export function App() {
	return (
		<Routes>
			<Route path="/game" element={ <GameRoute /> } />
			{/* <Route path="/test" element={ <Router.Test /> } /> */}
			
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