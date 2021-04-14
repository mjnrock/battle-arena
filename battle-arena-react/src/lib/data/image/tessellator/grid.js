import Agency from "@lespantsfancy/agency";
import Tessellation from "../../../render/Tessellation";

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

export async function ToCanvasMap(tw, th, canvas, { keyFn, asTessellation = false, includeMeta = false, anchorPoint } = {}) {
    const obj = await ToGrid(tw, th, canvas, { keyFn });
    const image = await Agency.Util.Base64.Decode(obj.source);

    let res = {};
    for(let [ key, [ x, y, tw, th ]] of Object.entries(obj.tiles)) {
        const cvs = document.createElement("canvas");
        cvs.width = tw;
        cvs.height = th;

        const ctx = cvs.getContext("2d");
        ctx.drawImage(image,
            x, y, tw, th,
            0, 0, tw, th,
        );

        cvs.__anchorPoint = typeof anchorPoint === "function" ? anchorPoint(key, x, y, tw, th) : [ 0, 0 ];
        // cvs.__anchorPoint = typeof anchorPoint === "function" ? anchorPoint(key, x, y, tw, th) : [ tw / 2, th / 2 ];

        res[ key ] = cvs;
    }

    if(asTessellation) {
        res = await Promise.resolve(new Tessellation(res));
    }

    if(includeMeta) {
        return [ res, { tw, th, width: canvas.width, height: canvas.height } ];
    }

    return res;
}

export default {
    ToGrid,
    ToCanvasMap,
};