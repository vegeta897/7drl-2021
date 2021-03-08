import { Directions, Grid, MoveGrids } from './types'
import { TILE_SIZE } from './index'

export function reverseDirection(direction: Directions): Directions {
	switch (direction) {
		case Directions.Up:
			return Directions.Down
		case Directions.Down:
			return Directions.Up
		case Directions.Left:
			return Directions.Right
		case Directions.Right:
			return Directions.Left
	}
}

function getClockwiseDirection(direction: Directions): Directions {
	switch (direction) {
		case Directions.Up:
			return Directions.Right
		case Directions.Right:
			return Directions.Down
		case Directions.Down:
			return Directions.Left
		case Directions.Left:
			return Directions.Up
	}
}

export function turnDirection(
	direction: Directions,
	turns: number
): Directions {
	let turned = direction
	for (let i = 0; i < turns; i++) {
		turned = getClockwiseDirection(turned)
	}
	return turned
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
