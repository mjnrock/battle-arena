/* eslint-disable */
import Agency from "@lespantsfancy/agency";

export default class KeyManager extends Agency.Context {
    constructor() {
        super();

        window.onkeydown = e => this.emit("key", "down", e.which);
        window.onkeyup = e => this.emit("key", "up", e.which);

        // Create Singleton pattern
        if(!KeyManager.Instance) {
            KeyManager.Instance = this;
        }
    }

    // Access Singleton pattern via KeyManager.$
    static get $() {
        if(!KeyManager.Instance) {
            KeyManager.Instance = new KeyManager();
        }

        return KeyManager.Instance;
    }
}