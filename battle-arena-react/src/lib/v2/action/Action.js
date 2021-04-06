import Agency from "@lespantsfancy/agency";
import Effect from "./Effect";

export class Action extends Agency.Event.Emitter {
    /**
     * @activator Should only be used to << Entity[ Component ] >> data (e.g. insufficient mana)
     */
    constructor(afflictions = [], { data = {}, activator, onSuccess, onFailure } = {}) {
        super();

        this.afflictions = afflictions;
        this.data = data;

        if(typeof activator === "function") {
            this.activator = activator;
        } else {
            this.activator = () => true;
        }
        
        if(typeof onSuccess === "function") {
            this.onSuccess = onSuccess;
        }
        if(typeof onFailure === "function") {
            this.onFailure = onFailure;
        }
    }

    /**
     * These should be used as a processor, generator, and/or "cost" function (e.g. drain 50 mana|give 10 gold|etc.)
     *  If they are an <Effect>, instead, they will be invoked and passed the @source as the @target
     */
    onSuccess() {}
    onFailure() {}

    invoke(source, ...args) {
        if(this.activator(source, this.data, ...args)) {
            if(this.onSuccess instanceof Effect) {
                this.onSuccess.invoke({ target: source, source, data: this.data, ...args });
            } else {
                this.onSuccess(source, this.data, ...args);
            }

            this.$.emit("action", {
                source,
                afflictions: this.afflictions,
                data: this.data,
            });

            return true;
        }

        if(this.onFailure instanceof Effect) {
            this.onFailure.invoke({ target: source, source, data: this.data, ...args });
        } else {
            this.onFailure(source, this.data, ...args);
        }

        return false;
    }
};

export default Action;