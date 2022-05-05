import Message from "./Message";

/**
 * This is a holding object designed to both hold a collection of messages, and it can also be used as an iterator.
 * By using .next/.previous, the current index will first shift accordingly then return .current -- it will *not* wrap.
 */
export class MessageCollection {
	constructor(messages = [], { capacity = Infinity, current = 0 } = {}) {
		this.messages = new Set();
		this.config = {
			current: current,
			capacity: capacity,

			allowWrap: false,
		};

		this.addMany(messages);
	}

    [ Symbol.iterator ]() {
        var index = -1;
        var data = this.toArray();

        return {
            next: () => ({ value: data[ ++index ], done: !(index in data) })
        };
    };

	sort(fn, persist = false) {
		const sorted = this.toArray().sort(fn);

		if(persist === true) {
			this.messages = new Set(sorted);
		}

		return sorted;
	}
	filter(fn, persist = false) {
		const filtered = this.toArray().filter(fn);

		if(persist === true) {
			this.messages = new Set(filtered);
		}

		return filtered;
	}

	get head() {
		return this.messages.values().next().value;
	}
	get tail() {
		return this.toArray()[ this.messages.size ];
	}
	get first() {
		return this.toArray()[ 0 ];
	}
	get last() {
		return this.toArray()[ this.config.capacity ];
	}

	get current() {
		return this.toArray()[ this.config.current ];
	}
	set current(value) {
		if(value > this.config.capacity) {
			this.config.current = this.config.capacity;
		} else if(value < 0) {
			this.config.current = 0;
		} else {
			this.config.current = value;
		}

		return this;
	}

	get next() {
		if(this.current < this.capacity) {
			this.config.current += 1;
		} else if(this.current >= this.capacity && this.allowWrap === true) {
			this.config.current = 0;
		}
		
		return this.current;
	}
	get previous() {
		if(this.current > 0) {
			this.config.current -= 1;
		} else if(this.current <= 0 && this.allowWrap === true) {
			this.config.current = this.capacity;
		}
		
		return this.current;
	}
	reset() {
		this.config.current = 0;

		return this;
	}

	hasNext() {
		return this.config.current < this.config.capacity;
	}
	hasPrevious() {
		return this.config.current > 0;
	}

	get size() {
		return this.messages.size;
	}
	get remaining() {
		return this.config.capacity - this.messages.size;
	}

	isFull() {
		return this.messages.size === this.config.capacity;
	}
	isEmpty() {
		return this.messages.size === 0;
	}

	add(message) {
		if(this.messages.size < this.capacity) {
			if(Message.Is(message)) {
				this.messages.add(message);
			} else if(Message.Conforms(message)) {
				this.messages.add(Message.Copy(message, true));				
			}
		}

		return this;
	}
	addMany(addMessageArgs = []) {
		for(let message of addMessageArgs) {
			this.add(message);
		}

		return this;
	}
	remove(message) {
		return this.messages.delete(message);
	}
	removeMany(removeMessageArgs = []) {
		let results = [];
		for(let message of removeMessageArgs) {
			results.push(this.remove(message));
		}

		return results;
	}

	toArray() {
		return Array.from(this.messages.values());
	}
	toObject() {
		return this.toArray().map(msg => msg.toObject());
	}
	toJson() {
		return this.toArray().map(msg => msg.toJson());
	}

	static FromArray(messageArray = []) {
		return new MessageCollection(messageArray);
	}
	static FromObject(messageArray = []) {
		return new MessageCollection(messageArray.map(mo => Message.FromObject(mo)));
	}
	static FromJson(messageArray = []) {
		return new MessageCollection(messageArray.map(mj => Message.FromJson(mj)));
	}
};

export default MessageCollection;