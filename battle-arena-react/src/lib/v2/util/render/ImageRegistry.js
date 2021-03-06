import Agency from "@lespantsfancy/agency";

export const EnumEntity = {
    SQUIRREL: "squirrel",
    BUNNY: "bunny",
};

export const EnumState = {
    IDLE: 0,
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