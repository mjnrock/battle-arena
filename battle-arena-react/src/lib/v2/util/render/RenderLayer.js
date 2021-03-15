import EntityManager from "./../../manager/EntityManager";

export class RenderLayer {
    constructor(entities = []) {
        if(entities instanceof EntityManager) {
            this.entityMgr = entities;
        } else {
            this.entityMgr = new EntityManager(entities);
        }
    }
}

export default RenderLayer;