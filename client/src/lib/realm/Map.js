import { EntityRegistrar } from "../../data/components/Registrar";
import Entity from "../@agency/lib/ecs/Entity";
import Node from "./Node";

export class Map extends Entity {
	constructor (nodes = []) {
		super();

		this.register({
			nodes: EntityRegistrar({}),
		});

		for(let node of nodes) {
			if(node instanceof Node) {
				this.nodes.add(node);
			}
		}
	}
};

export default Map;