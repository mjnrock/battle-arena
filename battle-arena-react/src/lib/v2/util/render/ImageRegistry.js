import Agency from "@lespantsfancy/agency";

export const EnumEntity = {
    SQUIRREL: "squirrel",
    BUNNY: "bunny",
    BEAR: "bear",

    GHOST_SQUIRREL: "ghost-squirrel",
    GHOST_BUNNY: "ghost-bunny",
};

export const EnumTerrain = {
    VOID: "void",
    GRASS: "grass",
    DIRT: "dirt",
    WATER: "water",
    
    FIRE: "fire",
};

export const EnumState = {
    NORMAL: 0,
    EDGE_LONG: 1,
    EDGE_SHORT: 2,
};

export const EnumFacing = {
    SOUTH: 180,
    NORTH: 0,
    WEST: 270,
    EAST: 90,
};

export const EntityTemplate = [
    [ ...Object.values(EnumEntity) ],
    [ ...Object.values(EnumState) ],
    [ ...Object.values(EnumFacing) ],
];

export const TerrainTemplate = [
    [ ...Object.values(EnumTerrain) ],
    [ ...Object.values(EnumState) ],
    [ ...Object.values(EnumFacing) ],
];

export class ImageRegistry extends Agency.Util.CrossMap {
    constructor(dimensions, { spriteCoords = [], lookupFns = [] } = {}) {
        super(dimensions);

        for(let [ sprite, ...coords ] of spriteCoords) {
            this.set(sprite, ...coords);
        }

        for(let fn of lookupFns) {
            this.addLookup(fn);
        }
    }
}

export function FromFiles(pathCoords = [], { resolve, reject } = {}) {
    const ir = new ImageRegistry();

    let promises = [];
    for(let [ path, ...coords ] of pathCoords) {
        promises.push(Agency.Util.Base64.FileDecode(path).then(canvas => ir.set(canvas, ...coords)));
    }
    
    Promise.all(promises).then(resolve.bind(ir)).catch(reject);

    return ir;
};

ImageRegistry.FromFiles = FromFiles;

export default ImageRegistry;