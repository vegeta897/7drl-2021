export enum SystemGroup {
	Input = 'input',
	Update = 'update',
	AfterUpdate = 'afterUpdate',
	Render = 'render',
}

export enum Tags {
	New = 'new',
}

export enum ControllerState {
	Ready,
	Processing,
	Disabled,
}

export enum GlobalEntity {
	Game = 'game',
	Player = 'player',
	Camera = 'camera',
}

export enum Directions {
	Up,
	Down,
	Left,
	Right,
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

export enum GrindState {
	Start,
	Continue,
	End,
}
