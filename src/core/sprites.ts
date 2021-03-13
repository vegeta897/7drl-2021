import { BaseTexture, Texture, Rectangle, Sprite } from 'pixi.js'
import sheetImage from '../assets/sprites.png'

export const TILE_SIZE = 16

export enum TextureID {
	Blank,
	Floor,
	Wall,
	Player,
	Enemy,
	Dummy,
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
	RailUpRightGoLeft,
	RailUpLeftGoRight,
	RailDownRightGoLeft,
	RailDownLeftGoRight,
	RailUpRightGoDown,
	RailUpLeftGoDown,
	RailDownRightGoUp,
	RailDownLeftGoUp,
	RailBoostUp,
	RailBoostDown,
	RailBoostLeft,
	RailBoostRight,
	Zero,
	One,
	Two,
	Three,
	Four,
	Five,
	Six,
	Seven,
	Eight,
	Nine,
	Heart,
	PressEnter,
	HoldShift,
	Exit,
	Bone1,
	Bone2,
	Bone3,
	Bone4,
	Bone5,
	Bone6,
	DummyBit,
}

const textures = <Texture[]>[]

function loadSheet() {
	const baseTexture = BaseTexture.from(sheetDefinition.filename)
	baseTexture.scaleMode = 0
	for (const textureData of sheetDefinition.textures) {
		const { key, x, y, w, h, rotate, flip } = textureData
		textures[key] = new Texture(
			baseTexture,
			new Rectangle(x, y, w || TILE_SIZE, h || TILE_SIZE)
		)
		if (rotate) {
			textures[key].rotate = rotate * 2 // Packing rotation, 1 = 45 degrees CCW
		}
		if (flip) {
			textures[key].rotate += 8
		}
	}
	textures[TextureID.Blank] = Texture.WHITE
}

export function createSprite(textureID: TextureID): Sprite {
	return new Sprite(textures[textureID])
}

export function changeSpriteTexture(sprite: Sprite, textureName: TextureID) {
	sprite.texture = textures[textureName]
}

export function getTexture(textureID: TextureID): Texture {
	return textures[textureID]
}

export function getBoneTextures(): Texture[] {
	return [
		textures[
			(TextureID.Bone1,
			TextureID.Bone2,
			TextureID.Bone3,
			TextureID.Bone4,
			TextureID.Bone5,
			TextureID.Bone6)
		],
	]
}

const sheetDefinition = {
	filename: sheetImage,
	textures: [
		{
			key: TextureID.Wall,
			x: 51,
			y: 68,
		},
		{
			key: TextureID.Floor,
			x: 51,
			y: 119,
		},
		{
			key: TextureID.Player,
			x: 0,
			y: 17,
		},
		{
			key: TextureID.Enemy,
			x: 17,
			y: 17,
		},
		{
			key: TextureID.Dummy,
			x: 34,
			y: 17,
		},
		{
			key: TextureID.RailCross,
			x: 51,
			y: 0,
		},
		{
			key: TextureID.RailUpDown,
			x: 0,
			y: 0,
		},
		{
			key: TextureID.RailLeftRight,
			x: 0,
			y: 0,
			rotate: 1,
		},
		{
			key: TextureID.RailUpLeft,
			x: 17,
			y: 0,
			rotate: 2,
		},
		{
			key: TextureID.RailUpRight,
			x: 17,
			y: 0,
			rotate: 1,
		},
		{
			key: TextureID.RailDownLeft,
			x: 17,
			y: 0,
			rotate: 3,
		},
		{
			key: TextureID.RailDownRight,
			x: 17,
			y: 0,
		},
		{
			key: TextureID.RailUpDownLeft,
			x: 34,
			y: 0,
			rotate: 2,
		},
		{
			key: TextureID.RailUpDownRight,
			x: 34,
			y: 0,
		},
		{
			key: TextureID.RailUpLeftRight,
			x: 34,
			y: 0,
			rotate: 1,
		},
		{
			key: TextureID.RailDownLeftRight,
			x: 34,
			y: 0,
			rotate: 3,
		},
		{
			key: TextureID.RailDownRightGoUp,
			x: 68,
			y: 0,
		},
		{
			key: TextureID.RailUpRightGoLeft,
			x: 68,
			y: 0,
			rotate: 1,
		},
		{
			key: TextureID.RailUpLeftGoDown,
			x: 68,
			y: 0,
			rotate: 2,
		},
		{
			key: TextureID.RailDownLeftGoRight,
			x: 68,
			y: 0,
			rotate: 3,
		},
		{
			key: TextureID.RailUpRightGoDown,
			x: 68,
			y: 0,
			flip: true,
		},
		{
			key: TextureID.RailDownRightGoLeft,
			x: 68,
			y: 0,
			rotate: 1,
			flip: true,
		},
		{
			key: TextureID.RailDownLeftGoUp,
			x: 68,
			y: 0,
			rotate: 2,
			flip: true,
		},
		{
			key: TextureID.RailUpLeftGoRight,
			x: 68,
			y: 0,
			rotate: 3,
			flip: true,
		},
		{
			key: TextureID.RailBoostUp,
			x: 68,
			y: 17,
		},
		{
			key: TextureID.RailBoostDown,
			x: 68,
			y: 17,
			rotate: 2,
		},
		{
			key: TextureID.RailBoostLeft,
			x: 68,
			y: 17,
			rotate: 1,
		},
		{
			key: TextureID.RailBoostRight,
			x: 68,
			y: 17,
			rotate: 3,
		},
		{
			key: TextureID.Zero,
			x: 0,
			y: 85,
		},
		{
			key: TextureID.One,
			x: 17,
			y: 85,
		},
		{
			key: TextureID.Two,
			x: 34,
			y: 85,
		},
		{
			key: TextureID.Three,
			x: 51,
			y: 85,
		},
		{
			key: TextureID.Four,
			x: 68,
			y: 85,
		},
		{
			key: TextureID.Five,
			x: 0,
			y: 102,
		},
		{
			key: TextureID.Six,
			x: 17,
			y: 102,
		},
		{
			key: TextureID.Seven,
			x: 34,
			y: 102,
		},
		{
			key: TextureID.Eight,
			x: 51,
			y: 102,
		},
		{
			key: TextureID.Nine,
			x: 68,
			y: 102,
		},
		{
			key: TextureID.Heart,
			x: 68,
			y: 119,
		},
		{
			key: TextureID.PressEnter,
			x: 0,
			y: 119,
			w: 49,
			h: 33,
		},
		{
			key: TextureID.HoldShift,
			x: 0,
			y: 153,
			w: 43,
			h: 31,
		},
		{
			key: TextureID.Bone1,
			x: 51,
			y: 17,
			w: 5,
			h: 1,
		},
		{
			key: TextureID.Bone2,
			x: 51,
			y: 19,
			w: 7,
			h: 3,
		},
		{
			key: TextureID.Bone3,
			x: 51,
			y: 23,
			w: 4,
			h: 3,
		},
		{
			key: TextureID.Bone4,
			x: 51,
			y: 27,
			w: 4,
			h: 4,
		},
		{
			key: TextureID.Bone5,
			x: 51,
			y: 32,
			w: 3,
			h: 2,
		},
		{
			key: TextureID.Bone6,
			x: 61,
			y: 17,
			w: 4,
			h: 3,
		},
		{
			key: TextureID.DummyBit,
			x: 40,
			y: 18,
			w: 2,
			h: 2,
		},
	],
}

loadSheet()
