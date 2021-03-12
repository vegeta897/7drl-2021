import { Directions, Grid } from '../types'
import { TileMap } from '../util'

export type RailData = {
	flowMap: (Directions | undefined)[]
	booster: boolean
}

export type RailSegment = {
	direction: Directions
	startGrid: Grid
	railTiles: TileMap
	length: number
	rooms: Room[]
}

export type Room = {
	width: number
	height: number
	x1: number
	x2: number
	y1: number
	y2: number
	tiles: TileMap
}
