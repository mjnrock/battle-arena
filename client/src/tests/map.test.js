import Console from "../lib/@agency/util/Console";

import Node from "../lib/Node";
import Map from "../lib/Map";

Console.NewContext();

const [ n1, n2, n3 ] = Node.Factory(3, [], (i, node) => {	
	node.position.x = 0;
	node.position.y = i;

	Console.label(`n${ i + 1 }`, node.id, node.position.x, node.position.y);
});

// Console.label("n1", n1.id);
// Console.label("n1.position", n1.position);
// Console.label("n1.entities", n1.entities);

const map = new Map();

// map.nodes.registry.registerMany(n1, n2, n3);

map.nodes.registry.registerMany(n1, n2, n3);

// Console.label("map", map);
// Console.label("map.nodes", map.nodes);
Console.label(`node-0.0`, map.nodes.registry[ `0.0` ].id);
Console.label(`node-0.0`, map.nodes.node(`0.0`).id);
Console.label(`node-0.0`, map.nodes.node`0.0`.id);