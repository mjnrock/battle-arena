import Agency from "@lespantsfancy/agency";
import Tessellation from "../../../util/render/Tessellation";

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

export async function ToCanvasMap(tw, th, canvas, { keyFn, asTessellation = false } = {}) {
    const obj = await ToGrid(tw, th, canvas, { keyFn });
    const image = await Agency.Util.Base64.Decode(obj.source);

    const res = {};
    for(let [ key, [ x, y, tw, th ]] of Object.entries(obj.tiles)) {
        const cvs = document.createElement("canvas");
        cvs.width = tw;
        cvs.height = th;

        const ctx = cvs.getContext("2d");
        ctx.drawImage(image,
            x, y, tw, th,
            0, 0, tw, th,
        );

        res[ key ] = cvs;
    }

    if(asTessellation) {
        return Promise.resolve(new Tessellation(res));
    }

    return res;
}

export default {
    ToGrid,
    ToCanvasMap,
};