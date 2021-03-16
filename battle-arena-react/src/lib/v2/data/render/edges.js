import Agency from "@lespantsfancy/agency";

import { DictTerrain } from "./../entity/components/terrain";

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
export const ConnectivityEdgeMap = new Map();
//  None (e.g. a singularly-isolated *dirt* tile completely surrounded by *grass*--i.e. edges in all directions)
ConnectivityEdgeMap.set(0, Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.EAST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.WEST,
    EnumEdgeMask.NORTHEAST,
    EnumEdgeMask.NORTHWEST,
    EnumEdgeMask.SOUTHEAST,
    EnumEdgeMask.SOUTHWEST,
));

//  All (e.g. a *dirt* tile completely surrounded by *dirt*--i.e. no edges)
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.RIGHT,
    EnumConnectivityMask.DOWN,
    EnumConnectivityMask.LEFT,
), 0);

// Single Connection
ConnectivityEdgeMap.set(EnumConnectivityMask.UP , Agency.Util.Bitwise.add(0,
    EnumEdgeMask.WEST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.EAST,
    EnumEdgeMask.SOUTHWEST,
    EnumEdgeMask.SOUTHEAST,
));
ConnectivityEdgeMap.set(EnumConnectivityMask.RIGHT , Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.WEST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.NORTHWEST,
    EnumEdgeMask.SOUTHWEST,
));
ConnectivityEdgeMap.set(EnumConnectivityMask.DOWN , Agency.Util.Bitwise.add(0,
    EnumEdgeMask.WEST,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.EAST,
    EnumEdgeMask.NORTHWEST,
    EnumEdgeMask.NORTHEAST,
));
ConnectivityEdgeMap.set(EnumConnectivityMask.LEFT , Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.EAST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.NORTHEAST,
    EnumEdgeMask.SOUTHEAST,
));
    
// Two Connections
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.RIGHT,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.WEST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.SOUTHWEST,
    EnumEdgeMask.NORTHEAST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.RIGHT,
    EnumConnectivityMask.DOWN,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.WEST,
    EnumEdgeMask.NORTHWEST,
    EnumEdgeMask.SOUTHEAST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.LEFT,
    EnumConnectivityMask.DOWN,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.EAST,
    EnumEdgeMask.NORTHEAST,
    EnumEdgeMask.SOUTHWEST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.LEFT,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.EAST,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.SOUTHEAST,
    EnumEdgeMask.NORTHWEST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.LEFT,
    EnumConnectivityMask.RIGHT,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.SOUTH,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.DOWN,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.EAST,
    EnumEdgeMask.WEST,
));
    
//  Three Connections
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.RIGHT,
    EnumConnectivityMask.DOWN,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.WEST,
    EnumEdgeMask.NORTHEAST,
    EnumEdgeMask.SOUTHEAST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.RIGHT,
    EnumConnectivityMask.DOWN,
    EnumConnectivityMask.LEFT,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.NORTH,
    EnumEdgeMask.SOUTHEAST,
    EnumEdgeMask.SOUTHWEST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.DOWN,
    EnumConnectivityMask.LEFT,
    EnumConnectivityMask.UP,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.EAST,
    EnumEdgeMask.SOUTHWEST,
    EnumEdgeMask.NORTHWEST,
));
ConnectivityEdgeMap.set(Agency.Util.Bitwise.add(0,
    EnumConnectivityMask.LEFT,
    EnumConnectivityMask.UP,
    EnumConnectivityMask.RIGHT,
), Agency.Util.Bitwise.add(0,
    EnumEdgeMask.SOUTH,
    EnumEdgeMask.NORTHWEST,
    EnumEdgeMask.NORTHEAST,
));





function drawImage(ctx, image, x, y, scale, rotation){
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, x, y);
    ctx.rotate(rotation);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
} 

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
            drawImage(ctx, map.get("edge"), 0, 0, 1, 0);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.EAST)) {
            drawImage(ctx, map.get("edge"), map.get("edge").width, 0, 1, Math.PI / 2);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTH)) {
            drawImage(ctx, map.get("edge"),  map.get("edge").width, map.get("edge").height, 1, Math.PI);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.WEST)) {
            drawImage(ctx, map.get("edge"), 0, map.get("edge").height, 1, -Math.PI / 2);
        }

        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.NORTHWEST)) {
            drawImage(ctx, map.get("corner"), 0, 0, 1, 0);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.NORTHEAST)) {
            drawImage(ctx, map.get("corner"), map.get("corner").width, 0, 1, Math.PI / 2);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTHEAST)) {
            drawImage(ctx, map.get("corner"), map.get("corner").width, map.get("corner").height, 1, Math.PI);
        }
        if(Agency.Util.Bitwise.has(edgeMask, EnumEdgeMask.SOUTHWEST)) {
            drawImage(ctx, map.get("corner"), 0, map.get("corner").height, 1, -Math.PI / 2);
        }

        map.set(edgeMask, canvas);
    }
    
    return map;
}

export function CalculateEdgeMasks(world) {
    const dirs = [
        [ 0, -1, EnumEdgeMask.NORTH ],
        [ 1, 0, EnumEdgeMask.EAST ],
        [ 0, 1, EnumEdgeMask.SOUTH ],
        [ -1, 0, EnumEdgeMask.WEST ],

        [ -1, -1, EnumEdgeMask.NORTHWEST ],
        [ 1, -1, EnumEdgeMask.NORTHEAST ],
        [ 1, 1, EnumEdgeMask.SOUTHEAST ],
        [ -1, 1, EnumEdgeMask.SOUTHWEST ],
    ];

    for(let x = 0; x < world.width; x++) {
        for(let y = 0; y < world.height; y++) {
            const terrain = world.getTerrain(x, y);

            if(terrain.terrain.type === DictTerrain.DIRT.type) {
                dirs.forEach(([ dx, dy, mask ]) => {
                    let neigh = world.terrain[ `${ terrain.position.x + dx }.${ terrain.position.y + dy }` ];

                    if(neigh && neigh.terrain.type === DictTerrain.GRASS.type) {
                        terrain.terrain.edges = Agency.Util.Bitwise.add(terrain.terrain.edges, mask);
                    }
                });
            }
        }
    }
}