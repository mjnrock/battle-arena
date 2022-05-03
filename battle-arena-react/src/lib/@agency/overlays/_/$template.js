export const $template = node => ({
	/**
	 * This will execute directly *after* Eventable(node) has been evaluated
	 * 	but before any other entries have been be evaluated
	 */
	$pre(node, overlay) {},
	/**
	 * This will after *all* other overlay entries have been processed
	 */
	$post(node, overlay) {},
	
	state: {},
	nodes: {},
	triggers: {},
	subscriptions: [],
	meta: {},
	config: {},
	actions: {},
});

export default $template;