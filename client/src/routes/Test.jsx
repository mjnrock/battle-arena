import Node from "../game/lib/node/Node";
import BooleanNode from "../game/lib/node/BooleanNode";
import EnumNode from "../game/lib/node/EnumNode";
import NumberNode from "../game/lib/node/NumberNode";

// const node = new Node({
// 	data: 56,
// 	decoder: () => 93,
// });
// const bnode = new BooleanNode({
// 	data: 56,
// });
// const enode = new EnumNode({
// 	data: [ "cat", "dog", "bird" ],
// });
// enode.data = "cats";

// console.log(enode);
// console.log(enode.data);

// const nnode = new NumberNode({
// 	data: 9,
// });
const nnode = NumberNode.INT8.create({
	data: 9,
	// data: 900,
	// events: {
	// 	"*": [
	// 		() => console.log("1a"),
	// 		() => true,
	// 	],
	// 	test: () => console.log("test"),
	// 	"**": [
	// 		() => console.log("2a"),
	// 		() => console.log("2b"),
	// 	],
	// }
});

console.log(nnode);
console.log(nnode.data);

nnode.dispatch("test");

export function Test() {
	return (
		<div>
			hi
		</div>
	);
};

export default Test;