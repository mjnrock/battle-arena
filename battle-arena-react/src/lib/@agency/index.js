import Core from "./core/package";
import Util from "./util/package";

export const Agency = {
	Agent: Core.Agent,
	Context: Core.Context,

	ECS: {
		Struct: Core.Struct,
		Component: Core.Component,
		System: Core.System,
		Entity: Core.Entity,
	},
	Comm: {
		Message: Core.Message,
		MessageCollection: Core.MessageCollection,
	},
	
	Util: Util,
};

export default {
    ...Core,
	
    Util,
};