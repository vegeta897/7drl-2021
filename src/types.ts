export enum SystemGroup {
	Input = 'input',
	Main = 'beforeTween',
	Render = 'render',
}

export enum Tags {
	UpdateHUD = 'updateHUD',
	UpdateCamera = 'updateCamera',
	UpdateVisibility = 'updateVisibility',
}

export enum ControllerState {
	Ready,
	Processing,
	Disabled,
}

export enum GlobalEntity {
	Game = 'game',
	Player = 'player',
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
