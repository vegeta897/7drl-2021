import { Directions, Grid } from '../types'
import { TileData } from '../core/level'

export type RailData = {
	flowMap: Directions[]
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
