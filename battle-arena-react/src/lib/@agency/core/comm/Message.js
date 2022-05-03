import { v4 as uuid } from "uuid";

export class Message {
	constructor(data, tags = [], { id, info = {} } = {}, isLocked = true) {
		this.id = id || uuid();
		
		this.data = data;
		this.tags = tags instanceof Set ? tags : new Set(Array.isArray(tags) ? tags : [ tags ]);
		this.timestamp = Date.now();
		
		this.info = {
			isLocked: isLocked,
			
			...info,
		};
		
		return new Proxy(this, {
			get: (target, prop) => {
				return Reflect.get(target, prop);
			},
			set: (target, prop, value) => {
				if(target.info.isLocked === true) {
					return true;
				}

				return Reflect.set(target, prop, value);
			},
			deleteProperty: (target, prop) => {
				if(target.info.isLocked === true) {
					return true;
				}

				return Reflect.deleteProperty(target, prop);
			},
			defineProperty: (target, prop, attr) => {
				if(target.info.isLocked === true) {
					return true;
				}

				return Reflect.defineProperty(target, prop, attr);  
			},
		});
	}

	/**
	 * Since Messages will often be used with only one tag (i.e. functioning in the capacity of a ".type"), this abstracts that convenience
	 */
	get type() {
		return this.tags.values().next().value;
	}

	/**
	 * Convenience wrapper for Messages carrying Promise-payloads
	 */
	get then() {
		return Promise.resolve(this.data);
	}

	/**
	 * If @input = true, the clone the Message
	 * If @input is an object, copy with those overwrites
	 * Else, create a copy of Message without changes
	 */
	copy(input = false) {
		if(input === true) {
			return Message.Factory(1,
				this.data,
				this.tags,
				{
					id: this.id,
					info: this.info,
				},
			);
		} else if(typeof input === "object") {
			return Message.Factory(1,
				input.data !== void 0 ? input.data : this.data,
				input.tags || this.tags,
				{
					id: input.id,
					info: input.info || this.info,
				},
			);
		}

		return Message.Factory(1,
			this.data,
			this.tags,
			{
				info: this.info,
			},
		);
	}

	toObject() {
		return {
			...this,
		};
	}
	toJson() {
		return JSON.stringify(this.toObject());
	}

	static FromObject(obj = {}) {
		return Message.Copy(obj, true);
	}
	static FromJson(json, maxLoop = 10) {
		let obj = json;

		let i = 0;
		while((typeof obj === "string" || obj instanceof String) && i < maxLoop) {
			obj = JSON.parse(json);
			++i;
		}

		return Message.FromObject(obj);
	}

	static Conforms(obj) {
        if(typeof obj !== "object") {
            return false;
        }
        
        return "id" in obj
            && "tags" in obj
            && "data" in obj
            && "info" in obj
            && "timestamp" in obj;
    }
	
	/**
	 * Copy a Message instance of object.  If @clone = true, the @id will be copied, too.
	 */
	static Copy(msg, clone = false) {
		if(clone === true) {
			return Message.Factory(1, msg.data, msg.tags, { id: msg.id, config: msg.config });
		}

		return Message.Factory(1, msg.data, msg.tags, { config: msg.config });
	}
	/**
	 * A single-value convenience version of .Factory
	 */
	static Create(data, tags = [], { id, info = {} } = {}, isLocked = true) {
		return Message.Factory(1, data, tags, { id, info }, isLocked);
	}
	/**
	 * Create X number of Messages.
	 * If @id is a function, it will be executed on each iteration.
	 * If @data is a function, it will be executed on each iteration to generate the @args.  This overload will *ignore* all other passed args.  This can be used to dynamically generate a bunch of Messages.
	 */
	static Factory(qty = 1, data, tags = [], { id, info = {} } = {}, isLocked = true) {
		let ret = [];
		if(typeof qty === "function") {
			qty = qty(data, tags, info, isLocked);
		}

		if(typeof data === "function") {
			for(let i = 0; i <= qty; i++) {	
				const args = data(i);

				ret.push(new Message(...args));
			}
		} else {
			for(let i = 0; i <= qty; i++) {
				const newid =  typeof id === "function" ? id(i, data, tags, info, isLocked) : id;
	
				ret.push(new Message(data, tags, { id: newid, info }, isLocked));
			}
		}

		if(qty === 1) {
			return ret[ 0 ];
		}

		return ret;
	}
	/**
	 * A convenience combination of .Copy and .Create, which will decide which to perform internally.  This allows the user to pass either a Message object or a Message instance, without pre-checking.
	 */
	static Generate(data, tags = [], { id, info = {} } = {}, isLocked = true) {
		if(Message.Conforms(data)) {
			return Message.Copy(data, false);
		}

		return Message.Create(data, tags, { id, info }, isLocked);
	}
};

export default Message;