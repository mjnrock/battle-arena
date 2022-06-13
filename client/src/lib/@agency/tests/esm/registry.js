import Console from "../../util/Console";

import Registry from "../../$next/Registry";

Console.NewContext();

const registry = new Registry();

// console.log(registry.__entries);

let kid = registry.add("kiszka");
let bid = registry.add("buddha");
let mid = registry.add("marshall");
registry.addAlias(kid, "meows", "poofs");
registry.addAlias(bid, "rawrs");

registry.setPool("cats", kid);
registry.addToPool("cats", bid, mid);

// console.log(registry.__entries);
console.log(registry[ kid ]);
console.log(registry[ bid ]);
console.log(registry.meows);
console.log(registry.poofs);
console.log(registry.rawrs);
console.log(registry.cats);
registry.removeFromPool("cats", mid);
console.log(registry.cats);
console.log(registry.find(/1/gi).length);