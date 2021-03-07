import { Level, Tile, TileData } from './level'
import { Directions, MoveGrids } from './types'
import { addGrids } from './util'

export type RailTile = {
	linkedTo: TileData[]
	variation: number
}

// TODO: Don't store linked rails, get them during runtime so it can be dynamic
// If jumping on to rail laterally, don't start grinding
// The floor where a rail ending leads to/from is special!

export function createRails(level: Level) {
	const corridors = level.dungeon.getCorridors()
	const rails: Set<TileData> = new Set()
	for (const corridor of corridors) {
		if (!corridor._endsWithAWall) continue
		if (
			corridor._startX === corridor._endX &&
			corridor._startY === corridor._endY
		)
			continue
		corridor.create((x, y) => {
			const railTile: TileData = {
				x,
				y,
				type: Tile.Rail,
				seeThrough: true,
				rail: {
					linkedTo: [],
					variation: 0,
				},
			}
			level.data.set(x + ':' + y, railTile)
			rails.add(railTile)
		})
	}
	rails.forEach((railTile) => {
		let linkage = 0
		for (const direction of [
			Directions.Up,
			Directions.Down,
			Directions.Left,
			Directions.Right,
		]) {
			const neighborGrid = addGrids(railTile, MoveGrids[direction])
			const neighborTile = level.getTileAt(neighborGrid.x, neighborGrid.y)
			if (neighborTile?.type === Tile.Rail) {
				railTile.rail!.linkedTo[direction] = neighborTile
				linkage += 1 << direction
			}
		}
		railTile.rail!.variation = linkage
	})
}
