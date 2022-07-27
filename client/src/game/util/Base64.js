//TODO Newer JS syntax is not supported in a node-fetch dependency
import isBase64 from "is-base64";
import Identity from "../lib/Identity";
// import nodeFetch from "node-fetch";

// const envFetch = nodeFetch || fetch;
const envFetch = fetch;

export const Base64 = {
	test: input => isBase64(input, { mimeRequired: true }),

	// If successful, will return a base64 string with mime, else false
	Encode: (input, quality = 1.0) => {
		return new Promise((resolve, reject) => {
			try {
				if(input instanceof HTMLCanvasElement) {
					return resolve(input.toDataURL("image/png", quality));
				} else if(input instanceof HTMLImageElement) {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");

					canvas.width = input.width;
					canvas.height = input.height;

					ctx.drawImage(input, 0, 0);

					return resolve(Base64.Encode(canvas, quality));
				} else if(isBase64(input, { mimeRequired: true })) {
					return resolve(input);
				} else {
					return resolve(false);
				}
			} catch(e) {
				return reject(e);
			}
		});
	},

	// If successful, will return a resolve(<canvas>), else will reject(@input)
	Decode: (input) => {
		return new Promise((resolve, reject) => {
			try {
				if(input instanceof HTMLCanvasElement || input instanceof HTMLImageElement) {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");

					canvas.width = input.width;
					canvas.height = input.height;

					ctx.drawImage(input, 0, 0);

					return resolve(canvas);
				} else if(isBase64(input, { mimeRequired: true })) {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");

					const img = new Image();
					img.onload = () => {
						canvas.width = img.width;
						canvas.height = img.height;

						ctx.drawImage(img, 0, 0);

						return resolve(canvas);
					}
					img.src = input;
				} else {
					return reject(input);
				}
			} catch(e) {
				return reject(e);
			}
		});
	},

	DecodeFile: (path, allowAnonymous = false) => {
		return new Promise((resolve, reject) => {
			try {
				if(path.match(/\.(json|txt)/i)) {
					const opts = header => ({
						method: "GET",
						mode: allowAnonymous ? "cors" : "no-cors",
						headers: {
							"Content-Type": header
						},
					});

					if(path.match(/\.(json)/i)) {
						envFetch(path, opts("application/json"))
							.then(response => response.json())
							.then(data => {
								resolve(Base64.Decode(data))
							})
							.catch(e => reject(e));
					} else if(path.match(/\.(txt)/i)) {
						envFetch(path, opts("text/plain;charset=UTF-8"))
							.then(response => response.text())
							.then(data => {
								resolve(Base64.Decode(data))
							})
							.catch(e => reject(e));
					}
				} else {
					let img = new Image();
					if(allowAnonymous === true) {
						img.crossOrigin = "anonymous";
					}
					img.src = path;

					img.onload = () => {
						if(img.width) {
							resolve(Base64.Decode(img));
						}

						reject(false);
					};
					img.onerror = () => reject(false);
				}
			} catch(e) {
				return reject(e);
			}
		});
	},
	/**
	 * Allow for multiple files to be uploaded at once, resolving once all files are uploaded.
	 * You can pass an array of urls, or an object of alias:url pairs.  If an array is used, the
	 * alias will be the same as the url.
	 * 
	 * This invokes .FileDecode() for each path provided.
	 */
	DecodeFiles: (paths = [], allowAnonymous = false) => {
		return new Promise((resolve, reject) => {
			try {
				const promises = [];

				if(Identity.Comparators.IsStrictObject(paths)) {
					for(let [ alias, path ] of Object.entries(paths)) {
						promises.push(new Promise((resolve) => {
							Base64.DecodeFile(path, allowAnonymous).then(canvas => resolve([ alias, canvas ]));
						}));
					}
				} else if(Identity.Comparators.IsArray(paths)) {
					for(let path of paths) {
						promises.push(new Promise((resolve) => {
							Base64.DecodeFile(path, allowAnonymous).then(canvas => resolve([ path, canvas ]));
						}));
					}
				}

				Promise.all(promises)
					.then(results => {
						const data = {};
						for(let [ alias, canvas ] of results) {
							data[ alias ] = canvas;
						}

						resolve(data);
					})
					.catch(e => reject(e));
			} catch(e) {
				return reject(e);
			}
		});
	}
};

export default Base64;