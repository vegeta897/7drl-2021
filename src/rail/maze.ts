// import { Level } from '../level'
// import IceyMaze from 'rot-js/lib/map/iceymaze'
// import { Directions, Grid } from '../types'
// import { RailData } from './types'
// import { addGrids, moveDirectional } from '../util'
// import { createRailTile } from './util'

// export function createRailMazesInRooms(level: Level) {
// 	const rooms = level.dungeon.getRooms()
// 	for (const room of rooms) {
// 		const roomWidth = room._x2 - room._x1 + 1
// 		const roomHeight = room._y2 - room._y1 + 1
// 		// Maze must have odd dimensions
// 		const mazeWidth = roomWidth - ((roomWidth + 1) % 2)
// 		const mazeHeight = roomHeight - ((roomHeight + 1) % 2)
// 		const maze = new IceyMaze(mazeWidth, mazeHeight, 2)
// 		const mazeRailTiles: Map<string, Grid> = new Map()
// 		maze.create((x, y, value) => {
// 			if (value === 0) mazeRailTiles.set(x + ':' + y, { x, y })
// 		})
// 		mazeRailTiles.forEach((tile, grid) => {
// 			const { x, y } = tile
// 			let linkage = 0
// 			const directions: RailData['directions'] = []
// 			for (let dir: Directions = 0; dir < 4; dir++) {
// 				const { x: nx, y: ny } = addGrids({ x, y }, moveDirectional(dir))
// 				if (mazeRailTiles.has(nx + ':' + ny)) {
// 					linkage += 1 << dir
// 					directions.push(dir)
// 				}
// 			}
// 			const railTile = createRailTile(room._x1 + x, room._y1 + y, {
// 				directions,
// 				linkage,
// 			})
// 			level.tiles.set(railTile.x + ':' + railTile.y, railTile)
// 		})
// 	}
// }
