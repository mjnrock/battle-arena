import AgencyBase from "../../core/AgencyBase";

export class System extends AgencyBase {
	constructor({ id, tags } = {}) {
		super({ id, tags });
	}
};

export default System;