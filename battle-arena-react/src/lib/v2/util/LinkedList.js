export class LinkedListNode {
	constructor(data) {
		this._data = data;
		this._previous = null;
		this._next = null;
	}
}

export class LinkedList {
	constructor() {
        this._length = 0;        
		this._head = null;
		this._tail = null;
	}

    size() {
        return this._length;
    }
	get(index) {
		let curr = this._head,
			i = 0;

		if (this._length === 0 || index < 0 || index > this._length - 1) {
			return false;
		}
		
		while (i < index) {
			curr = curr._next;
			i++;
		}
		
		return curr;
	}

	add(value) {
		let node = new LinkedListNode(value);

		if(this._length > 0) {
			this._tail._next = node;
			node._previous = this._tail;
			this._tail = node;
		} else {
			this._head = node;
			this._tail = node;
		}

		this._length++;

		return this;
	}
	remove(index) {
		if (this._length === 0 || index < 0 || index > this._length - 1) {
			return false;
		}

		if(index === 0) {
			if(!this._head._next) {
				this._head = null;
				this._tail = null;
			} else {
				this._head = this._head._next;
			}
		} else if(index === this._length - 1) {
			this._tail = this._tail._previous;
		} else {
			let i = 0,
				curr = this._head;
			while(i < index) {
				curr = curr._next;
				i++;
			}
			
			curr._previous._next = curr._next;
			curr._next._previous = curr._previous;
		}
				
		this._length--;
		if(this._length === 1) {
			this._tail = this._head;
		}
		if(this._length > 0) {
			this._head._previous = null;
			this._tail._next = null;
		}


		return this;
	}
}

export default LinkedList;