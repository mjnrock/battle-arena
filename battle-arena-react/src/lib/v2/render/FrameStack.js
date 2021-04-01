import { v4 as uuidv4, validate } from "uuid";

import Frame from "./Frame";

export class FrameStack {
    constructor(frames = []) {
        this.__id = uuidv4();
        
        this.frames = frames;
    }

    add(...frames) {
        this.frames.push(...frames);

        return this;
    }
    remove(...idsFramesOrIndexes) {
        for(let entry of idsFramesOrIndexes) {
            if(typeof entry === "number") {
                this.frames.splice(entry, 1);
            } else if(entry instanceof Frame) {
                this.frames = this.frames.filter(sprite => sprite !== entry);
            } else if(validate(entry)) {
                this.frames = this.frames.filter(sprite => sprite.__id !== entry);
            } else if(typeof entry === "function") {
                this.frames = this.frames.filter(sprite => entry(sprite) !== false);
            } 
        }

        return this;
    }
    swap(i1, i2) {
        [ this.frames[ i1 ], this.frames[ i2 ] ] = [ this.frames[ i2 ], this.frames[ i1 ] ];

        return this;
    }

    get(tx, ty) {
        return FrameStack.Get(this.frames, tx, ty);
    }
    paint(tx, ty, canvas, px, py, opts = {}) {
        return FrameStack.Paint(this.frames, tx, ty, canvas, px, py, opts);
    }
}

export function Get(franes, tx, ty) {
    const results = [];
    for(let frame of franes) {
        results.push(frame.get(tx, ty));
    }

    return results;
};
export function Paint(frames, tx, ty, canvas, px, py, opts = {}) {
    const obj = {
        data: [],   // This will contain the <Frame>.paint return data, in order
        width: 0,   // This will become the MAX <Frame>.canvas.width
        height: 0,  // This will become the MAX <Frame>.canvas.height
    };

    for(let sprite of frames) {
        const res = sprite.paint(tx, ty, canvas, px, py, opts);            
        obj.data.push(res);
        obj.width = Math.max(res.width, obj.width);
        obj.height = Math.max(res.height, obj.height);
    }

    return obj;
};

export function Flatten(frameStack, { canvas, ctxType = "2d" } = {}) {
    if(!(canvas instanceof HTMLCanvasElement)) {
        canvas = document.createElement("canvas");
    }

    let width = 0,
        height = 0;
    for(let frame of frameStack) {
        const [ w, h ] = frame.size;

        width = Math.max(width, w);
        height = Math.max(height, h);
    }

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext(ctxType);
    for(let frame of frameStack) {
        ctx.drawImage(frame, 0, 0);
    }

    return canvas;
};

FrameStack.Duration = Duration;
FrameStack.Get = Get;
FrameStack.Paint = Paint;

FrameStack.Flatten = Flatten;

export default FrameStack;