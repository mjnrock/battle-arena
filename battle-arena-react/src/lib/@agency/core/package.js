import Agent from "./Agent";
import Context from "./Context";

import ECS from "./ecs/package";
import Comm from "./comm/package";

//TODO Convert the Nexus into a Node with a "Nexus" Component or with an Overlay

export default {
	Agent,
	Context,

	...ECS,
	...Comm,
};