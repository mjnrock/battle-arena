import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import Sprite from "./Sprite";
import Frame from "./Frame";

export class SpriteSheet {
    /**
     * <SpriteSheet> is meant to be an entity-specific repository
     *      for any still frame or animation necessary for that
     *      entity.  As the entry list is a POJO, any key is acceptable;
     *      however, the [ 0 ] key is interpreted as the "default", for the
     *      common case of a <SpriteSheet> wrapping a single <Frame(X)|Sprite(X)>.
     * @param {Frame|FrameStack|Sprite|SpriteStack} entries
     */
    constructor(entries = {}) {
        this.__id = uuidv4();

        this.entries = entries;
    }

    get default() {
        return this.entries[ 0 ];
    }

    set(key, entry) {
        this.entries[ key ] = entry;

        if(!this.default) {
            this.entries[ 0 ] = entry;
        }

        return this;
    }

    get(elapsed, key) {
        const entry = this.entries[ key ] || this.default;

        if(entry) {
            if(Array.isArray(elapsed)) {
                return entry.get(...elapsed);    // <Frame|FrameStack>
            }

            return entry.get(elapsed);    // <Sprite|SpriteStack>
        }

        return [];
    }
    paint(key, elapsed, canvas, px, py, opts = {}) {
        const entry = this.entries[ key ] || this.default;

        if(entry) {
            if(Array.isArray(elapsed)) {
                return entry.paint(...elapsed, canvas, px, py, opts);    // <Frame|FrameStack>
            }

            return entry.paint(elapsed, canvas, px, py, opts);    // <Sprite|SpriteStack>
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

export function Generate(entries = {}) {
    return new SpriteSheet(entries);
};

SpriteSheet.Hash = Hash;
SpriteSheet.Generate = Generate;

export default SpriteSheet;