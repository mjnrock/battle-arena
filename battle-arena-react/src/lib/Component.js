import Agency from "@lespantsfancy/agency";

export default class Component extends Agency.Registry {
    constructor(type, state = {}) {
        super();

        this.type = type;

        for(let [ key, value ] of Object.entries(state)) {
            this.register(value, key);
        }
    }

    get id() {
        return this._id;
    }
}