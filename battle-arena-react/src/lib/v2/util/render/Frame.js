import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import Canvas from "./Canvas";
import TileCanvas from "./TileCanvas";

export class Frame extends TileCanvas {
    constructor(canvas, { width = 0, height = 0, tw = 1, th = 1, __inherit = false }) {
        super(tw, th, { width, height });
        this.__id = uuidv4();

        if(__inherit) {
            return this;
        }

        this.canvas = canvas;

        this.__hash = Frame.Hash(this.canvas, { algorithm: "md5" });
    }

    get hash() {
        return this.__hash;
    }
    get size() {
        return [ this.canvas.width, this.canvas.height ];
    }

    get(tx, ty) {
        return [ tx * this.tw, ty * this.th, this.tw, this.th ];
    }
    
    /**
     * Same as .get(elapsed), but paints to a passed @canvas at [ @px, @py ]
     */
    paint(tx, ty, canvas, px, py, { ctxType = "2d" } = {}) {
        const [ x, y, width, height ] = this.get(tx, ty);

        if(canvas instanceof Canvas) {
            canvas.image(
                this.canvas,
                x,
                y,
                width,
                height,
                px,
                py,
                width,
                height,
            );
        } else {
            const ctx = canvas.getContext(ctxType);
            ctx.drawImage(
                this.canvas,
                x,
                y,
                width,
                height,
                px,
                py,
                width,
                height,
            );
        }

        return { tx, ty, x, y, width, height };
    }
};

export function DrawTransform(ctx, image, x, y, scale, rotation){
    ctx.save();
    ctx.setTransform(scale, 0, 0, scale, x, y);
    ctx.rotate(rotation);
    ctx.drawImage(image, 0, 0);
    ctx.restore();
};
export function DrawRotate0(ctx, image) {
    DrawTransform(ctx, image, 0, 0, 1, 0);
};
export function DrawRotate90(ctx, image) {
    DrawTransform(ctx, image, image.width, 0, 1, Math.PI / 2);
};
export function DrawRotate180(ctx, image) {
    DrawTransform(ctx, image, image.width, image.height, 1, Math.PI);
};
export function DrawRotate270(ctx, image) {
    DrawTransform(ctx, image, 0, image.height, 1, -Math.PI / 2);
};

Frame.DrawTransform = DrawTransform;
Frame.DrawRotate0 = DrawRotate0;
Frame.DrawRotate90 = DrawRotate90;
Frame.DrawRotate180 = DrawRotate180;
Frame.DrawRotate270 = DrawRotate270;

export function Hash(canvas, { algorithm = "md5" } = {}) {
    if(canvas instanceof HTMLCanvasElement) {
        const base64 = canvas.toDataURL("image/png", 1.0);
        
        return crypto.createHash(algorithm).update(base64).digest("hex");
    }

    return false;
};

export function Generate(score, opts = {}) {
    return new Frame(score, opts);
};

Frame.Hash = Hash;
Frame.Generate = Generate;

export default Frame;