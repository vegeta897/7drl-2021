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

export function getLinkage(dirs: Directions[]): number {
	let linkage = 0
	for (const dir of dirs) {
		linkage += 1 << dir
	}
	return linkage
}

export function getSpriteProperties(
	railData: RailData
): { texture: TextureID; tint: number } {
	let texture = TextureID.RailCross
	switch (railData.linkage) {
		case 0b0001:
		case 0b0010:
		case 0b0011:
			texture = TextureID.RailUpDown
			break
		case 0b0100:
		case 0b1000:
		case 0b1100:
			texture = TextureID.RailLeftRight
			break
		case 0b0101:
			texture = TextureID.RailUpLeft
			break
		case 0b1001:
			texture = TextureID.RailUpRight
			break
		case 0b0110:
			texture = TextureID.RailDownLeft
			break
		case 0b1010:
			texture = TextureID.RailDownRight
			break
		case 0b0111:
			texture = TextureID.RailUpDownLeft
			break
		case 0b1011:
			texture = TextureID.RailUpDownRight
			break
		case 0b1101:
			texture = TextureID.RailUpLeftRight
			break
		case 0b1110:
			texture = TextureID.RailDownLeftRight
			break
	}
	return { texture, tint: railData.booster ? 0xbf1d30 : 0x9a6348 }
}
