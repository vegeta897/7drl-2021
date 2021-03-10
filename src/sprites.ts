import { BaseTexture, Texture, Rectangle, Sprite } from 'pixi.js'
import sheetImage from './assets/1bitpack_kenney.png'

export enum TextureID {
	Floor,
	Wall,
	Player,
	Enemy,
	RailCross,
	RailUpDown,
	RailLeftRight,
	RailUpLeft,
	RailUpRight,
	RailDownLeft,
	RailDownRight,
	RailUpDownLeft,
	RailUpDownRight,
	RailUpLeftRight,
	RailDownLeftRight,
}

const textures = <Texture[]>[]

function loadSheet() {
	const baseTexture = BaseTexture.from(sheetDefinition.filename)
	baseTexture.scaleMode = 0
	for (const textureData of sheetDefinition.textures) {
		const { key, x, y, w, h, rotate } = textureData
		textures[key] = new Texture(baseTexture, new Rectangle(x, y, w, h))
		if (rotate) {
			textures[key].rotate = rotate * 2 // Packing rotation, 1 = 45 degrees CCW
		}
	}
	textures[TextureID.Floor] = Texture.WHITE
}

export function createSprite(textureName: TextureID): Sprite {
	return new Sprite(textures[textureName])
}

export function changeSpriteTexture(sprite: Sprite, textureName: TextureID) {
	sprite.texture = textures[textureName]
}

const sheetDefinition = {
	filename: sheetImage,
	textures: [
		{
			key: TextureID.Wall,
			x: 51,
			y: 306,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.Player,
			x: 476,
			y: 0,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.Enemy,
			x: 493,
			y: 102,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.RailCross,
			x: 51,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.RailUpDown,
			x: 0,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.RailLeftRight,
			x: 0,
			y: 85,
			w: 16,
			h: 16,
			rotate: 1,
		},
		{
			key: TextureID.RailUpLeft,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 2,
		},
		{
			key: TextureID.RailUpRight,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 1,
		},
		{
			key: TextureID.RailDownLeft,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
			rotate: 3,
		},
		{
			key: TextureID.RailDownRight,
			x: 17,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.RailUpDownLeft,
			x: 34,
			y: 85,
			w: 16,
			h: 16,
			rotate: 2,
		},
		{
			key: TextureID.RailUpDownRight,
			x: 34,
			y: 85,
			w: 16,
			h: 16,
		},
		{
			key: TextureID.RailUpLeftRight,
			x: 34,
			y: 85,
			w: 16,
			h: 16,
			rotate: 1,
		},
		{
			key: TextureID.RailDownLeftRight,
			x: 34,
			y: 85,
			w: 16,
			h: 16,
			rotate: 3,
		},
	],
}

loadSheet()
