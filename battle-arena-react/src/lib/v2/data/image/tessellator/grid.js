import Agency from "@lespantsfancy/agency";

export async function ToGrid(tw, th, canvas, { keyFn = (x, y) => `${ x }.${ y }`, asJson = false } = {}) {
    const obj = {
        width: canvas.width,
        height: canvas.height,
        source: await Agency.Util.Base64.Encode(canvas),
        tiles: {},
    };

    for(let x = 0; x < canvas.width; x += tw) {
        for(let y = 0; y < canvas.height; y += th) {
            obj.tiles[ keyFn(x / tw, y / th) ] = [ x, y, tw, th ];
        }
    }

    if(asJson) {
        return JSON.stringify(obj);
    }
    
    return obj;
};

export default ToGrid;