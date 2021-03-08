import * as rotJS from 'rot-js'
import { Level, Tile, TileData } from './level'
import { Directions, Grid, MoveGrids } from './types'
import { addGrids } from './util'

export type RailTile = {
	directions: Directions[]
	linkage: number
}

export function createRails(level: Level) {
	const rooms = level.dungeon.getRooms()
	for (const room of rooms) {
		const roomWidth = room._x2 - room._x1 + 1
		const roomHeight = room._y2 - room._y1 + 1
		// Maze must have odd dimensions
		const mazeWidth = roomWidth - ((roomWidth + 1) % 2)
		const mazeHeight = roomHeight - ((roomHeight + 1) % 2)
		const maze = new rotJS.Map.IceyMaze(mazeWidth, mazeHeight, 2)
		const mazeRailTiles: Map<string, Grid> = new Map()
		maze.create((x, y, value) => {
			if (value === 0) mazeRailTiles.set(x + ':' + y, { x, y })
		})
		mazeRailTiles.forEach((tile, grid) => {
			const { x, y } = tile
			let linkage = 0
			const directions: RailTile['directions'] = []
			for (let dir: Directions = 0; dir < 4; dir++) {
				const { x: nx, y: ny } = addGrids({ x, y }, MoveGrids[dir])
				if (mazeRailTiles.has(nx + ':' + ny)) {
					linkage += 1 << dir
					directions.push(dir)
				}
			}
			const railTile: TileData = {
				x: room._x1 + x, // Include room X,Y to get global position
				y: room._y1 + y,
				type: Tile.Rail,
				seeThrough: true,
				rail: {
					directions,
					linkage,
				},
			}
			level.data.set(railTile.x + ':' + railTile.y, railTile)
		})
	}
}
