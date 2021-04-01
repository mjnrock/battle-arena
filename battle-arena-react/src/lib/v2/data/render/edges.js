import Agency from "@lespantsfancy/agency";
import Frame from "../../util/render/Frame";

import { DictTerrain } from "./../entity/components/terrain";

//TODO  This entire edge situation is pretty iffy; basics work but still need a lot of improvement and reconsideration.
//? Removing "corners" and making edges blend decently can relieve some basic headache and simplify greatly out of the gate
/**
 * ! The "Connectivity" paradigm is for INNER "path tile(s)" only, but the rest of the setup doesn't not adhere to this fact
 * Also ALL map edges get an edge
 * This also only works on DIRT with GRASS adjacency
 */

export const EnumEdgeMask = {
    NORTH: 1 << 0,
    EAST: 1 << 1,
    SOUTH: 1 << 2,
    WEST: 1 << 3,

    // Practically speaking, these will often functionally be a combination in INNER scenarios; but explicated for OUTER scenarios and for completeness
    NORTHEAST: 1 << 4,  // This represents a corner, NOT a combination
    SOUTHEAST: 1 << 5,  // This represents a corner, NOT a combination
    NORTHWEST: 1 << 6,  // This represents a corner, NOT a combination
    SOUTHWEST: 1 << 7,  // This represents a corner, NOT a combination
};

export const EnumConnectivityMask = {
    UP: 1 << 0,
    RIGHT: 1 << 1,
    DOWN: 1 << 2,
    LEFT: 1 << 3,
};

//? The key is meant to be used in an *equality* comparison
export const ConnectivityEdgeMap = new Map([
    //  None (e.g. a singularly-isolated *dirt* tile completely surrounded by *grass*--i.e. edges in all directions)
    [ 0, Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ) ],

    //  All (e.g. a *dirt* tile completely surrounded by *dirt*--i.e. no edges)
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
    ), 0 ],

    // Single Connection
    [ EnumConnectivityMask.UP , Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.SOUTHEAST,
    ) ],
    [ EnumConnectivityMask.RIGHT , Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHWEST,
    ) ],
    [ EnumConnectivityMask.DOWN , Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.NORTHEAST,
    ) ],
    [ EnumConnectivityMask.LEFT , Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHEAST,
    ) ],
        
    // Two Connections
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.NORTHEAST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.SOUTHEAST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.DOWN,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.EAST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.LEFT,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.NORTHWEST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.RIGHT,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.SOUTH,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.DOWN,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.WEST,
    ) ],
        
    //  Three Connections
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.WEST,
        EnumEdgeMask.NORTHEAST,
        EnumEdgeMask.SOUTHEAST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.RIGHT,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.NORTH,
        EnumEdgeMask.SOUTHEAST,
        EnumEdgeMask.SOUTHWEST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.DOWN,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.UP,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.EAST,
        EnumEdgeMask.SOUTHWEST,
        EnumEdgeMask.NORTHWEST,
    ) ],
    [ Agency.Util.Bitwise.add(0,
        EnumConnectivityMask.LEFT,
        EnumConnectivityMask.UP,
        EnumConnectivityMask.RIGHT,
    ), Agency.Util.Bitwise.add(0,
        EnumEdgeMask.SOUTH,
        EnumEdgeMask.NORTHWEST,
        EnumEdgeMask.NORTHEAST,
    ) ],
]);



export function createEdgeMap(edgeCanvas) {
    const map = new Map();
    map.set("edge", document.createElement("canvas"));
    map.set("corner", document.createElement("canvas"));

    map.get("edge").width = edgeCanvas.width;
    map.get("edge").height = edgeCanvas.width;

    map.get("corner").width = edgeCanvas.width;
    map.get("corner").height = edgeCanvas.width;

    map.get("edge").getContext("2d").drawImage(edgeCanvas, 0, 0, edgeCanvas.width, edgeCanvas.width, 0, 0, edgeCanvas.width, edgeCanvas.width);
    map.get("corner").getContext("2d").drawImage(edgeCanvas, 0, edgeCanvas.width, edgeCanvas.width, edgeCanvas.width, 0, 0, edgeCanvas.width, edgeCanvas.width);

    for(let [ connMask, edgeMask ] of ConnectivityEdgeMap.entries()) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = edgeCanvas.width;
        canvas.height = edgeCanvas.width;   // sic
        
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.NORTH)) {
            Frame.DrawRotate0(ctx, map.get("edge"));
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.EAST)) {
            Frame.DrawRotate90(ctx, map.get("edge"));
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTH)) {
            Frame.DrawRotate180(ctx, map.get("edge"));
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.WEST)) {
            Frame.DrawRotate270(ctx, map.get("edge"));
        }

        // if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.NORTHWEST)) {
        //     Frame.DrawRotate0(ctx, map.get("corner"));
        // }
        // if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.NORTHEAST)) {
        //     Frame.DrawRotate90(ctx, map.get("corner"));
        // }
        // if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTHEAST)) {
        //     Frame.DrawRotate180(ctx, map.get("corner"));
        // }
        // if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTHWEST)) {
        //     Frame.DrawRotate270(ctx, map.get("corner"));
        // }

        map.set(connMask, canvas);
    }
    
    return map;
}

export function CalculateEdgeMasks(world) {
    const dirs = [
        [ 0, -1, EnumConnectivityMask.UP ],
        [ 1, 0, EnumConnectivityMask.RIGHT ],
        [ 0, 1, EnumConnectivityMask.DOWN ],
        [ -1, 0, EnumConnectivityMask.LEFT ],

        // [ -1, -1, EnumEdgeMask.NORTHWEST ],
        // [ 1, -1, EnumEdgeMask.NORTHEAST ],
        // [ 1, 1, EnumEdgeMask.SOUTHEAST ],
        // [ -1, 1, EnumEdgeMask.SOUTHWEST ],
    ];

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            const terrain = world.getTerrain(x, y);

            if(terrain.terrain.type === DictTerrain.DIRT.type) {
                dirs.forEach(([ dx, dy, mask ]) => {
                    let neigh = world.getTerrain(terrain.position.x + dx, terrain.position.y + dy);

                    if(neigh && neigh.terrain.type === DictTerrain.DIRT.type) {
                        terrain.terrain.edges = Agency.Util.Bitwise.add(terrain.terrain.edges, mask);
                    }
                });
            }
        }
    }
}