import { Directions, Grid } from '../types'

export const Tints = [
	0x990000,
	0x007700,
	0x4444dd,
	0x990099,
	0x999900,
	0x009999,
]

export type RailData = {
	directions: Directions[]
	linkage: number
}

export type Stretch = {
	direction: Directions
	possibleDirections: Directions[]
	startGrid: Grid
	endGrid?: Grid
	length: number
	room?: Room
}

export type Room = {
	width: number
	length: number
	x1: number
	x2: number
	y1: number
	y2: number
}
