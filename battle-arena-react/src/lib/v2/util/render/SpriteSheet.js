import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import Sprite from "./Sprite";
import Frame from "./Frame";

export class SpriteSheet {
    constructor(sprites = {}) {
        this.__id = uuidv4();

        this.sprites = sprites;
    }

    get default() {
        return this.sprites[ 0 ];
    }

    set(key, sprite) {
        this.sprites[ key ] = sprite;

        if(!this.default) {
            this.sprites[ 0 ] = sprite;
        }

        return this;
    }

    get(elapsed, key) {
        const sprite = this.sprites[ key ] || this.default;

        if(sprite) {
            return sprite.get(elapsed);
        }

        return [];
    }
    paint(key, elapsed, canvas, px, py, opts = {}) {
        const sprite = this.sprites[ key ] || this.default;

        if(sprite) {
            return sprite.paint(elapsed, canvas, px, py, opts);
        }

        return {};
    }
};

export function Hash(canvas, { algorithm = "md5" } = {}) {
    if(canvas instanceof HTMLCanvasElement) {
        const base64 = canvas.toDataURL("image/png", 1.0);
        
        return crypto.createHash(algorithm).update(base64).digest("hex");
    }

    return false;
};

export function Generate(sprites = {}) {
    return new SpriteSheet(sprites);
};

SpriteSheet.Hash = Hash;
SpriteSheet.Generate = Generate;

export default SpriteSheet;