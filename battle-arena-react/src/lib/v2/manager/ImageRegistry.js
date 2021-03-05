import Agency from "@lespantsfancy/agency";

export const EnumFacing = {
    NORTH: 0,
    SOUTH: 180,
    EAST: 90,
    WEST: 270,
};

export const EnumState = {
    IDLE: 0,
    MOVING: 1,
    ATTACKING: 2,
};

export class ImageRegistry extends Agency.Util.CrossMap {
    constructor(base64Coords = []) {
        super([
            [ ...Object.values(EnumFacing) ],
            [ ...Object.values(EnumState) ],
        ]);

        for(let [ base64, ...coords ] of base64Coords) {
            this.set(base64, ...coords);
        }
    }
}

export default ImageRegistry;