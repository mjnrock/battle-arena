import { useContext, useEffect, useState } from "react";

export function useAgent(agent) {
	const [ state, setState ] = useState(agent.state);

	useEffect(() => {
		const handler = () => setState(agent.state);

		agent.addTrigger(agent.config.notifyTrigger, handler);
		
		return () => {
			agent.removeTrigger(agent.config.notifyTrigger, handler);
		};
	}, []);

	return {
		agent,
		state,
		dispatch: agent.invoke.bind(agent),
	};
}

export function useAgency(context, key) {
	const agent = useContext(key ? context[ key ] : context);
	const controlObj = useAgent(agent);

	return controlObj;
}

export default useAgency;