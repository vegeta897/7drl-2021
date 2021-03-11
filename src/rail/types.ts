import { Directions, Grid } from '../types'
import { TileData } from '../core/level'

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
	booster: boolean
}

export type Stretch = {
	direction: Directions
	possibleDirections: Directions[]
	startGrid: Grid
	endGrid?: Grid
	rails: Map<string, Grid & RailData>
	length: number
	room?: Room
}

export type Room = {
	width: number
	height: number
	x1: number
	x2: number
	y1: number
	y2: number
	tiles: TileData[]
}
