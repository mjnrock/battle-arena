import Console from "../../util/Console";

import Component from "../../core/ecs/Component";
import Entity from "../../core/ecs/Entity";
import System from "../../core/ecs/System";

Console.NewContext("This test suite is designed to the basic event and hook functionality of the Context class.");

const comp = new Component("test");

const [ e1, e2, e3 ] = Entity.Factory(3, [ [
	comp,
], {

}]);

Console.label("E1", e1.id);
Console.label("E2", e2.id);
Console.label("E3", e3.id);

const system = new System([
	e1,
	e2,
	e3,
]);

Console.label("system", system.id);
Console.label("system.registry", system.registry.id);

console.log(system);