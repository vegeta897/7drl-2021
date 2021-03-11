export enum SystemGroup {
	Input = 'input',
	Main = 'beforeTween',
	AfterTween = 'afterTween',
	Render = 'render',
}

export enum Tags {
	UpdateHUD = 'updateHUD',
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
