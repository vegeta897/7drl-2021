import { RailData, Tints } from './types'
import { Tile, TileData } from '../level'
import { Directions } from '../types'

export function createRailTile(
	x: number,
	y: number,
	railData: RailData
): TileData {
	return {
		x,
		y,
		type: Tile.Rail,
		seeThrough: true,
		rail: railData,
	}
}

export function createFloorTile(x: number, y: number, tint?: number): TileData {
	return {
		x,
		y,
		type: Tile.Floor,
		seeThrough: true,
		tint: tint !== undefined ? Tints[tint % Tints.length] : undefined,
	}
}

export function getLinkage(dirs: Directions[]): number {
	let linkage = 0
	for (const dir of dirs) {
		linkage += 1 << dir
	}
	return linkage
}
