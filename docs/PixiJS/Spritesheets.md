### JSON Data
```
/** Represents the JSON data for a spritesheet atlas. */
export interface ISpritesheetFrameData {
	frame: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
	trimmed?: boolean;
	rotated?: boolean;
	sourceSize?: {
		w: number;
		h: number;
	};
	spriteSourceSize?: {
		x: number;
		y: number;
	};
	anchor?: IPointData;
}

/** Atlas format. */
export interface ISpritesheetData {
	frames: Dict<ISpritesheetFrameData>;
	animations?: Dict<string[]>;
	meta: {
		scale: string;
		// eslint-disable-next-line camelcase
		related_multi_packs?: string[];
	};
}
```

### Spritesheet Internals
```
/**
* A map containing all textures of the sprite sheet.
* Can be used to create a Sprite:
* ```js
* new PIXI.Sprite(sheet.textures["image.png"]);
* ```
*/
public textures: Dict<Texture>;

/**
* A map containing the textures for each animation.
* Can be used to create an AnimatedSprite:
* ```js
* new PIXI.AnimatedSprite(sheet.animations["anim_name"])
* ```
*/
public animations: Dict<Texture[]>;

/**
* Reference to the original JSON data.
* @type {object}
*/
public data: ISpritesheetData;
```