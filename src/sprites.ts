import { BaseTexture, Texture, Rectangle, Sprite } from 'pixi.js'
import sheetImage from './assets/1bitpack_kenney.png'

export enum TextureName {
	Floor = 'floor',
	Wall = 'wall',
	Player = 'player',
	RailCross = 'railCross',
	RailUpDown = 'railUpDown',
	RailLeftRight = 'railLeftRight',
	RailUpLeft = 'railUpLeft',
	RailUpRight = 'railUpRight',
	RailDownLeft = 'railDownLeft',
	RailDownRight = 'railDownRight',
}

const textures = <Texture[]>[]

function loadSheet() {
	const baseTexture = BaseTexture.from(sheetDefinition.filename)
	baseTexture.scaleMode = 0
	for (const textureData of sheetDefinition.textures) {
		const { key, x, y, w, h, rotate } = textureData
		textures[key] = new Texture(baseTexture, new Rectangle(x, y, w, h))
		if (rotate) {
			textures[key].rotate = rotate * 2 // Packing rotation, 1 = 45 degrees
		}
	}
	textures[TextureName.Floor] = Texture.WHITE
}

export function createSprite(spriteName: TextureName) {
	const sprite = new Sprite(textures[spriteName])
	switch (spriteName) {
		case TextureName.Player:
			break
	}
	return sprite
}

const sheetDefinition = {
	filename: sheetImage,
	textures: [
		{
			key: TextureName.Wall,
			x: 51,
			y: 306,
			w: 16,
			h: 16,
		},
		{
			key: TextureName.Player,
			x: 476,
			y: 0,
			w: 16,
			h: 16,
		},
		{
			key: TextureName.RailCross,
			x: 51,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureName.RailUpDown,
			x: 0,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureName.RailLeftRight,
			x: 0,
			y: 85,
			w: 16,
			h: 16,
			rotate: 1,
		},
		{
			key: TextureName.RailUpLeft,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 2,
		},
		{
			key: TextureName.RailUpRight,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 1,
		},
		{
			key: TextureName.RailDownLeft,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 3,
		},
		{
			key: TextureName.RailDownRight,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
		},
	],
}

loadSheet()
