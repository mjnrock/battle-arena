import { validate } from "uuid";
import Registry, { RegistryEntry } from "../Registry";
import Channel from "./Channel";

export class Network extends Registry {
	constructor(channels = [], agencyBaseObj = {}) {
		super(channels, agencyBaseObj);
		
		this.encoder = Registry.Encoders.InstanceOf(this, Channel);
	}

	addChannel(channel, alias) {
		return this.registerWithAlias(channel, alias);
	}
	removeChannel(channel) {
		if(validate(channel)) {
			return this.remove(channel);
		} else if(channel instanceof Channel) {
			return this.remove(channel.id);
		}
	}
	addSubscriberTo(channelIdOrAlias, subscriber, callback) {
		let id;
		if(channelIdOrAlias instanceof Channel) {
			id = channelIdOrAlias.id;
		} else {
			id = channelIdOrAlias;
		}
		const value = this.getEntryValue(id);

		if(value instanceof Channel) {
			return value.addSubscriber(subscriber, callback);
		}

		return false;
	}
	removeSubscriberFrom(channelIdOrAlias, subscriber) {
		let id;
		if(channelIdOrAlias instanceof Channel) {
			id = channelIdOrAlias.id;
		} else {
			id = channelIdOrAlias;
		}
		const value = this.getEntryValue(id);

		if(value instanceof Channel) {
			return value.removeSubscriber(subscriber);
		}

		return false;
	}

	sendTo(input, ...args) {
		if(this.has(input)) {
			const entry = this.getEntry(input);
			const value = entry.getValue(this);

			if(validate(input)) {
				return value.send(...args);
			} else {
				if(entry.type === RegistryEntry.Type.ALIAS) {
					return value.send(...args);
				} else if(entry.type === RegistryEntry.Type.POOL) {
					const pool = this.getPool(input);
					for(const channel of pool) {
						this.sendTo(channel, ...args);
					}
				}
			}
		} else if(input instanceof Channel) {
			return this.sendTo(input.id, ...args);
		}
	}
	broadcast(...args) {
		for(let channel of this.iterator) {
			this.sendTo(channel, ...args);
		}

		return this;
	}
};

export default Network;