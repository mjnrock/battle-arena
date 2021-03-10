export function heuristic(a, b) {
    const [ x1, y1 ] = a;
    const [ x2, y2 ] = b;

    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    // return Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
}

export function biasedHeuristic(p0, p1, p2, isBiased) {
    if (isBiased && (p2.length > 0)) {
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

            return path.reverse();
        }

        for (let next of world.adjacent(...current, false)) {
            let new_cost = cost_so_far[ current.toString() ] + (world.cost(...next) || 0);

            if (!(next.toString() in cost_so_far) || (new_cost < cost_so_far[ next.toString() ])) {
                cost_so_far[ next.toString() ] = new_cost;
                let priority = new_cost + biasedHeuristic(next, goal, start, true);

                frontier.push([ next, priority ]);

                came_from[ next.toString() ] = current;
            }
        }

        frontier.sort(([ , a ], [ , b ]) => b - a);   // Sort such that highest cost: i = 0, lowest cost: i = length - 1
    }

    return came_from;
};

export default findPath;