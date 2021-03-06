import { Directions, Grid } from '../types'

export function reverseDirection(direction: Directions) {
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

export function turnDirection(direction: Directions, turns: number) {
	let turned = direction
	for (let i = 0; i < turns; i++) {
		turned = (turned + 1) % 4
	}
	return turned
}

export function reverseMove(move: Grid) {
	return { x: move.x * -1, y: move.y * -1 }
}

export function addGrids(...grids: Grid[]) {
	const sum = { x: 0, y: 0 }
	for (const grid of grids) {
		sum.x += grid.x
		sum.y += grid.y
	}
	return sum
}
