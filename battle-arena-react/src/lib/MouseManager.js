/* eslint-disable */
import Agency from "@lespantsfancy/agency";

export default class MouseManager extends Agency.Context {
    constructor() {
        super();

        // Create Singleton pattern
        if(!MouseManager.Instance) {
            MouseManager.Instance = this;
        }
    }

    // Access Singleton pattern via MouseManager.$
    static get $() {
        if(!MouseManager.Instance) {
            MouseManager.Instance = new MouseManager();
        }

        return MouseManager.Instance;
    }
}