export class Console {
	static NewContext() {
		console.clear();
		console.warn(`*************************************************`);
		console.warn(`************* NEW EXECUTION CONTEXT *************`);
		console.warn(`*************************************************`);

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
	static hr(count = 5, symbol = "-") {
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