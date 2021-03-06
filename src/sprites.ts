import { BaseTexture, Texture, Rectangle, Sprite } from 'pixi.js'
import sheetImage from './assets/1bitpack_kenney.png'

export enum SPRITES {
	Floor = 'floor',
	Wall = 'wall',
	Player = 'player',
	Rail = 'rail',
}

const textures = <Texture[]>[]

function loadSheet() {
	const baseTexture = BaseTexture.from(sheetDefinition.filename)
	baseTexture.scaleMode = 0
	for (const texture of sheetDefinition.textures) {
		const { key, x, y, w, h } = texture
		textures[key] = new Texture(baseTexture, new Rectangle(x, y, w, h))
	}
	textures[SPRITES.Floor] = Texture.WHITE
}

export function createSprite(spriteName: SPRITES) {
	const sprite = new Sprite(textures[spriteName])
	switch (spriteName) {
		case SPRITES.Player:
			break
	}
	return sprite
}

const sheetDefinition = {
	filename: sheetImage,
	textures: [
		{
			key: SPRITES.Wall,
			x: 51,
			y: 306,
			w: 16,
			h: 16,
		},
		{
			key: SPRITES.Player,
			x: 476,
			y: 0,
			w: 16,
			h: 16,
		},
		{
			key: SPRITES.Rail,
			x: 51,
			y: 85,
			w: 16,
			h: 16,
		},
	],
}

loadSheet()
