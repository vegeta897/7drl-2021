import { Directions, Grid } from './types'
import { RNG } from 'rot-js'
import { TILE_SIZE } from './core/sprites'
import { TileData } from './core/level'

const clockwise = [
	Directions.Up,
	Directions.Right,
	Directions.Down,
	Directions.Left,
]

export const DirectionNames = ['Up', 'Down', 'Left', 'Right']

export function getDirections(exclude: Directions[] = []): Directions[] {
	return clockwise.filter((dir) => !exclude.includes(dir))
}

export function reverseDirection(direction: Directions): Directions {
	return clockwise[(clockwise.indexOf(direction) + 2) % 4]
}

export function turnClockwise(
	direction: Directions,
	turns: number = 1
): Directions {
	return clockwise[(clockwise.indexOf(direction) + turns) % 4]
}

export function reverseMove(move: Grid): Grid {
	return { x: move.x * -1, y: move.y * -1 }
}

export function isHorizontal(dir: Directions): boolean {
	return dir === Directions.Left || dir === Directions.Right
}

export function isVertical(dir: Directions): boolean {
	return dir === Directions.Up || dir === Directions.Down
}

export function addGrids(...grids: Grid[]): Grid {
	const sum = { x: 0, y: 0 }
	for (const grid of grids) {
		sum.x += grid.x
		sum.y += grid.y
	}
	return sum
}

export function diffGrids(a: Grid, b: Grid): Grid {
	return { x: a.x - b.x, y: a.y - b.y }
}

export function equalGrid(a: Grid, b: Grid): boolean {
	return a.x === b.x && a.y === b.y
}

function _moveDir(dir: Directions, distance: number = 1): Grid {
	switch (dir) {
		case Directions.Up:
			return { x: 0, y: -distance }
		case Directions.Down:
			return { x: 0, y: distance }
		case Directions.Left:
			return { x: -distance, y: 0 }
		case Directions.Right:
			return { x: distance, y: 0 }
	}
}

// Offset is positive in the relative right of direction
// TODO: Make this take a starting grid? check usages
export function moveDirectional(
	dir: Directions,
	distance: number = 1,
	offset: number = 0
): Grid {
	return addGrids(_moveDir(dir, distance), _moveDir(turnClockwise(dir), offset))
}

export function getNeighbors(
	grid: Grid,
	includeDiagonal: boolean = false
): Grid[] {
	const neighbors = [
		addGrids(grid, _moveDir(Directions.Up)),
		addGrids(grid, _moveDir(Directions.Down)),
		addGrids(grid, _moveDir(Directions.Left)),
		addGrids(grid, _moveDir(Directions.Right)),
	]
	if (includeDiagonal) {
		clockwise.forEach((dir) =>
			neighbors.push(addGrids(grid, moveDirectional(dir, 1, 1)))
		)
	}
	return neighbors
}

export function getDirectionFromMove(move: Grid): Directions {
	if (Math.abs(move.x) > Math.abs(move.y)) {
		if (move.x > 0) return Directions.Right
		if (move.x < 0) return Directions.Left
	} else {
		if (move.y > 0) return Directions.Down
		if (move.y < 0) return Directions.Up
	}
	throw 'Invalid move'
}

export function checkCollisionInRadius(
	grids: Grid[],
	center: Grid,
	radius: number
): boolean {
	for (let x = center.x - radius; x < center.x + radius + 1; x++) {
		for (let y = center.y - radius; y < center.y + radius + 1; y++) {
			if (grids.find((grid) => grid.x === x && grid.y === y)) return true
		}
	}
	return false
}

export function tileToSpritePosition(tile: Grid): Grid {
	return { x: tile.x * TILE_SIZE, y: tile.y * TILE_SIZE }
}

export function getNormalWithMin(mean: number, min: number): number {
	return Math.max(min, Math.round(RNG.getNormal(mean, mean / 2)))
}
export function getUpperNormal(
	min: number,
	stdDev: number,
	max: number = Infinity
): number {
	return Math.min(max, min + Math.floor(Math.abs(RNG.getNormal(0, stdDev))))
}

export class TileMap {
	data: Map<string, TileData> = new Map()
	has(x: number, y: number): boolean {
		return this.data.has(TileMap.keyFromXY(x, y))
	}
	get(x: number, y: number): TileData | undefined {
		return this.data.get(TileMap.keyFromXY(x, y))
	}
	set(x: number, y: number, tile: TileData): void {
		this.data.set(TileMap.keyFromXY(x, y), tile)
	}
	static keyFromXY(x, y) {
		return x + ':' + y
	}
}
