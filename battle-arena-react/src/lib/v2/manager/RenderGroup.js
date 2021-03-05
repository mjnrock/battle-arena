import EntityManager from "./EntityManager";
import ImageRegistry from "./ImageRegistry";

export class RenderGroup {
    constructor(entities = [], base64s = []) {
        super();

        this.entityManager = new EntityManager(entities);
        this.imageRegistry = new ImageRegistry(base64s);
    }
}

export default RenderGroup;