export class Console {
	static NewContext(description) {
		console.clear();
		console.warn(`*************************************************`);
		console.warn(`************* NEW EXECUTION CONTEXT *************`);
		console.warn(`*************************************************`);

		if(description) {
			Console.info(description);
			console.warn(`-------------------------------------------------`);
		}

		Console.br(1);

		return this;
	}

	static clear(...args) {
		console.clear(...args);
	}
	static log(...args) {
		console.log(...args);
	}
	static info(...args) {
		console.info(...args);
	}
	static warn(...args) {
		console.warn(...args);
	}
	static error(...args) {
		console.error(...args);
	}
	static label(text, ...args) {
		console.log(`[${ text.toUpperCase().replace(/[^\w\d-\.]+/gi, `_`) }]:`, ...args);
	}
	static labelTime(text, ...args) {
		console.log(`[${ Date.now().toString() }][${ text.toUpperCase().replace(/[^\w\d]+/gi, `_`) }]:`, ...args);
	}

	static br(times = 1) {
		for(let i = 0; i < times; i++) {
			console.log(``);
		}

		return this;
	}

	static line(count, symbol) {
		console.log(Array.apply(null, Array(count)).map(() => symbol).join(""));

		return this;
	}
	static hr(count = 40, symbol = "-") {
		this.line(count, symbol);

		return this;
	}

	static section(text) {
		Console.br(1);
		console.log(`=================================`);
		console.log(`==========| ${ text } |==========`);
		console.log(`=================================`);
		Console.br(1);

		return this;
	}
	static sub(text) {
		Console.br(1);
		console.log(`---------------------------------`);
		console.log(`----------| ${ text } |----------`);
		console.log(`---------------------------------`);
		Console.br(1);

		return this;
	}

	static h1(text) {
		Console.br(1);
		console.log(`==========| ${ text } |==========`);
		Console.br(1);

		return this;
	}
	static h2(text) {
		Console.br(1);
		console.log(`----------| ${ text } |----------`);
		Console.br(1);

		return this;
	}

	static open(text) {
		let l1 = `****************** < ${ text } > ******************`;

		Console.br(1);
		this.line(l1.length, "*");
		Console.log(l1);
		Console.br(1);
	}
	static close(text) {
		let l1 = `****************** </ ${ text } > ******************`;

		Console.br(1);
		Console.log(l1);
		this.line(l1.length, "*");
		Console.br(1);
	}
}

export default Console;