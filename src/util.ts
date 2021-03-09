import { Directions, Grid } from './types'
import { TILE_SIZE } from './index'
import { RNG } from 'rot-js'

const clockwise = [
	Directions.Up,
	Directions.Right,
	Directions.Down,
	Directions.Left,
]

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
export function moveDirectional(
	dir: Directions,
	distance: number = 1,
	offset: number = 0
): Grid {
	return addGrids(_moveDir(dir, distance), _moveDir(turnClockwise(dir), offset))
}

export function getNeighbors(grid: Grid): Set<Grid> {
	return new Set([
		addGrids(grid, _moveDir(Directions.Up)),
		addGrids(grid, _moveDir(Directions.Down)),
		addGrids(grid, _moveDir(Directions.Left)),
		addGrids(grid, _moveDir(Directions.Right)),
	])
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
