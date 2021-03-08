import { Directions, Grid, MoveGrids } from './types'
import { TILE_SIZE } from './index'

const clockwise = [
	Directions.Up,
	Directions.Right,
	Directions.Down,
	Directions.Left,
]

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

export function getNeighbors(grid: Grid): Set<Grid> {
	return new Set([
		addGrids(grid, MoveGrids[Directions.Up]),
		addGrids(grid, MoveGrids[Directions.Down]),
		addGrids(grid, MoveGrids[Directions.Left]),
		addGrids(grid, MoveGrids[Directions.Right]),
	])
}

export function tileToSpritePosition(tile: Grid): Grid {
	return { x: tile.x * TILE_SIZE, y: tile.y * TILE_SIZE }
}
