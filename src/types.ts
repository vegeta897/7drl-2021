export enum SystemGroup {
	Input = 'input',
	Update = 'update',
}

export enum Tags {
	New = 'new',
}

export enum Entities {
	Player = 'player',
	Camera = 'camera',
}

export enum Directions {
	Up,
	Right,
	Down,
	Left,
}

export type Grid = {
	x: number
	y: number
}

export const MoveGrids: Record<Directions, Grid> = {
	[Directions.Up]: { x: 0, y: -1 },
	[Directions.Right]: { x: 1, y: 0 },
	[Directions.Down]: { x: 0, y: 1 },
	[Directions.Left]: { x: -1, y: 0 },
}
