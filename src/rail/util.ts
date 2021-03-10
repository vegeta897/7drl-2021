import { RailData } from './types'
import { Tile, TileData } from '../level'
import { Directions } from '../types'

export function createTile(x, y, type, seeThrough = true) {
	return {
		x,
		y,
		type,
		seeThrough,
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
	return createTile(x, y, Tile.Wall, false)
}

export function getLinkage(dirs: Directions[]): number {
	let linkage = 0
	for (const dir of dirs) {
		linkage += 1 << dir
	}
	return linkage
}
