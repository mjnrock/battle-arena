export function heuristic(p0, p1, p2, isBiased) {
    if (isBiased && p2.length) {
        return (Math.abs(p0[ 0 ] - p1[ 0 ]) + Math.abs(p0[ 1 ] - p1[ 1 ])) * (Math.abs((p0[ 0 ] - p1[ 0 ]) * (p2[ 1 ] - p1[ 1 ]) - (p2[ 0 ] - p1[ 0 ]) * (p0[ 1 ] - p1[ 1 ])) * 0.001);
    }

    return Math.abs(p0[ 0 ] - p1[ 0 ]) + Math.abs(p0[ 1 ] - p1[ 1 ]);
}

export function findPath(world, start = [], goal = []) {
    const frontier = [];
    frontier.push([ start, 0 ]);

    let came_from = [];
    let cost_so_far = {};

    cost_so_far[ start.toString() ] = 0;

    while (!frontier.isEmpty) {
        let [ current ] = frontier.pop();   // Grab lowest cost option

        if (current.toString() === goal.toString()) {
            current = goal;
            let path = [];
            while (current.toString() !== start.toString()) {
                path.push(current);
                current = came_from[ current.toString() ];
            }

            return path.reverse();  // This starts with the goal and works backward, thus reverse the array so i = 0 is the start
        }

        for (let next of world.adjacent(...current, false)) {
            let new_cost = cost_so_far[ current.toString() ] + (world.cost(...next) || 0);

            if (!(next.toString() in cost_so_far) || (new_cost < cost_so_far[ next.toString() ])) {
                cost_so_far[ next.toString() ] = new_cost;
                let priority = new_cost + heuristic(next, goal, start, true);

                frontier.push([ next, priority ]);

                came_from[ next.toString() ] = current;
            }
        }

        frontier.sort(([ , a ], [ , b ]) => b - a);   // Sort such that highest cost: i = 0, lowest cost: i = length - 1
    }

    return came_from;
};

export default findPath;