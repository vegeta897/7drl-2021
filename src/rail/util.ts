import { RailData } from './types'
import { Tile, TileData } from '../core/level'
import { Directions } from '../types'
import { TextureID } from '../core/sprites'

export function createTile(x, y, type, seeThrough = true, solid = false) {
	return {
		x,
		y,
		type,
		seeThrough,
		solid,
		revealed: 0,
	}
}

export function createRailTile(
	x: number,
	y: number,
	railData: RailData
): TileData {
	return {
		...createTile(x, y, Tile.Rail),
		rail: railData,
	}
}

export function createFloorTile(x: number, y: number): TileData {
	return createTile(x, y, Tile.Floor)
}

export function createWallTile(x: number, y: number): TileData {
	return createTile(x, y, Tile.Wall, false, true)
}

export function getSpriteProperties(
	railData: RailData
): { texture: TextureID; tint: number } {
	let texture = TextureID.RailCross
	const [fromUp, fromDown, fromLeft, fromRight] = railData.flowMap

	if (
		fromUp === Directions.Down &&
		fromDown === Directions.Up &&
		fromLeft === Directions.Right &&
		fromRight === Directions.Left
	) {
		texture = TextureID.RailCross
	} else if (
		fromUp === Directions.Down &&
		fromDown === Directions.Up &&
		fromLeft === Directions.Up
	) {
		texture = TextureID.RailDownLeftGoUp
	} else if (
		fromUp === Directions.Down &&
		fromDown === Directions.Up &&
		fromLeft === Directions.Down
	) {
		texture = TextureID.RailUpLeftGoDown
	} else if (
		fromUp === Directions.Down &&
		fromDown === Directions.Up &&
		fromRight === Directions.Up
	) {
		texture = TextureID.RailDownRightGoUp
	} else if (
		fromUp === Directions.Down &&
		fromDown === Directions.Up &&
		fromRight === Directions.Down
	) {
		texture = TextureID.RailUpRightGoDown
	} else if (
		fromLeft === Directions.Right &&
		fromRight === Directions.Left &&
		fromDown === Directions.Left
	) {
		texture = TextureID.RailDownRightGoLeft
	} else if (
		fromLeft === Directions.Right &&
		fromRight === Directions.Left &&
		fromDown === Directions.Right
	) {
		texture = TextureID.RailDownLeftGoRight
	} else if (
		fromLeft === Directions.Right &&
		fromRight === Directions.Up &&
		fromUp === Directions.Left
	) {
		texture = TextureID.RailUpRightGoLeft
	} else if (
		fromLeft === Directions.Up &&
		fromRight === Directions.Left &&
		fromUp === Directions.Right
	) {
		texture = TextureID.RailUpLeftGoRight
	} else if (fromUp === Directions.Down && fromDown === Directions.Up) {
		texture = TextureID.RailUpDown
	} else if (fromLeft === Directions.Right && fromRight === Directions.Left) {
		texture = TextureID.RailLeftRight
	} else if (fromUp === Directions.Right && fromRight === Directions.Up) {
		texture = TextureID.RailUpRight
	} else if (fromUp === Directions.Left && fromLeft === Directions.Up) {
		texture = TextureID.RailUpLeft
	} else if (fromDown === Directions.Right && fromRight === Directions.Down) {
		texture = TextureID.RailDownRight
	} else if (fromDown === Directions.Left && fromLeft === Directions.Down) {
		texture = TextureID.RailDownLeft
	} else {
		throw `invalid rail type ${[fromUp, fromDown, fromLeft, fromRight]}`
	}
	return { texture, tint: railData.booster ? 0xff0000 : 0xffffff }
}
