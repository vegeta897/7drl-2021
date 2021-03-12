import { RailData } from './types'
import { Tile, TileData } from '../core/level'
import { Directions } from '../types'
import { TextureID } from '../core/sprites'
import { DirectionNames } from '../util'

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
	const [goingUp, goingDown, goingLeft, goingRight] = railData.flowMap

	if (
		goingUp === Directions.Up &&
		goingDown === Directions.Down &&
		goingLeft === Directions.Left &&
		goingRight === Directions.Right
	) {
		texture = TextureID.RailCross
	} else if (
		goingUp === Directions.Up &&
		goingDown === Directions.Down &&
		goingRight === Directions.Up
	) {
		texture = TextureID.RailDownLeftGoUp
	} else if (
		goingUp === Directions.Up &&
		goingDown === Directions.Down &&
		goingRight === Directions.Down
	) {
		texture = TextureID.RailUpLeftGoDown
	} else if (
		goingUp === Directions.Up &&
		goingDown === Directions.Down &&
		goingLeft === Directions.Up
	) {
		texture = TextureID.RailDownRightGoUp
	} else if (
		goingUp === Directions.Up &&
		goingDown === Directions.Down &&
		goingLeft === Directions.Down
	) {
		texture = TextureID.RailUpRightGoDown
	} else if (
		goingLeft === Directions.Left &&
		goingRight === Directions.Right &&
		goingUp === Directions.Left
	) {
		texture = TextureID.RailDownRightGoLeft
	} else if (
		goingLeft === Directions.Left &&
		goingRight === Directions.Right &&
		goingUp === Directions.Right
	) {
		texture = TextureID.RailDownLeftGoRight
	} else if (
		goingLeft === Directions.Left &&
		goingRight === Directions.Right &&
		goingDown === Directions.Left
	) {
		texture = TextureID.RailUpRightGoLeft
	} else if (
		goingLeft === Directions.Down &&
		goingRight === Directions.Right &&
		goingDown === Directions.Left
	) {
		texture = TextureID.RailUpLeftGoRight
	} else if (goingUp === Directions.Up && goingDown === Directions.Down) {
		texture = TextureID.RailUpDown
	} else if (goingLeft === Directions.Left && goingRight === Directions.Right) {
		texture = TextureID.RailLeftRight
	} else if (goingDown === Directions.Right && goingLeft === Directions.Up) {
		texture = TextureID.RailUpRight
	} else if (goingDown === Directions.Left && goingRight === Directions.Up) {
		texture = TextureID.RailUpLeft
	} else if (goingUp === Directions.Right && goingLeft === Directions.Down) {
		texture = TextureID.RailDownRight
	} else if (goingUp === Directions.Left && goingRight === Directions.Down) {
		texture = TextureID.RailDownLeft
	} else {
		logFlowMap(railData.flowMap)
		throw 'invalid flow map'
	}
	return { texture, tint: railData.booster ? 0xff0000 : 0xffffff }
}

export function logFlowMap(flowMap: RailData['flowMap']) {
	for (const [going, exit] of flowMap.entries()) {
		if (exit === undefined) continue
		console.log(
			'Going',
			DirectionNames[going],
			'--- Exit',
			DirectionNames[exit]
		)
	}
}
