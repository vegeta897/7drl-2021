import { RNG } from 'rot-js'
import { Tile, TileData } from '../core/level'
import { Directions, Grid } from '../types'
import {
	addGrids,
	equalGrid,
	getDirections,
	getNeighbors,
	getUpperNormal,
	isVertical,
	moveDirectional,
	reverseDirection,
} from '../util'
import { RailData, Room, Stretch } from './types'
import { createFloorTile, createRailTile, createWallTile } from './util'

export function createMainline():
	| { tiles: Map<string, TileData>; stretches: Stretch[]; rooms: Room[] }
	| false {
	const targetMainlineLength = 150
	const minStretchLength = 4 // NOT including walls
	const stretchLengthStdDev = 6
	const tiles: Map<string, TileData> = new Map()
	const stretches: Stretch[] = []
	const rooms: Room[] = []
	let totalMainlineLength = 0
	let finalStretch = false
	do {
		const prevStretch = stretches[stretches.length - 1]
		const firstStretch = !prevStretch
		const startGrid: Grid = prevStretch?.endGrid || { x: 0, y: 0 }
		let stretchLength = firstStretch
			? 20
			: getUpperNormal(minStretchLength, stretchLengthStdDev)
		const possibleDirections = getDirections(
			!firstStretch
				? [prevStretch.direction, reverseDirection(prevStretch.direction)]
				: []
		)
		finalStretch =
			totalMainlineLength + stretchLength >= targetMainlineLength &&
			(possibleDirections.includes(Directions.Right) ||
				possibleDirections.includes(Directions.Left))
		if (finalStretch) {
			stretchLength = 120
		}
		let validStretch
		let stretchDirection
		let stretchRails: Map<string, Grid & RailData>
		do {
			validStretch = true
			stretchDirection = RNG.getItem(possibleDirections)!
			possibleDirections.splice(possibleDirections.indexOf(stretchDirection), 1)
			stretchRails = new Map()
			// Check full rail path is clear
			for (let i = 0; i < stretchLength; i++) {
				const { x, y } = addGrids(
					startGrid,
					moveDirectional(stretchDirection, i)
				)
				if (
					stretches[0] &&
					Math.abs(stretches[0].startGrid.x - x) < 4 &&
					Math.abs(stretches[0].startGrid.y - y) < 4
				) {
					// Don't allow rails near starting room
					validStretch = false
					break
				}
				const gridKey = x + ':' + y
				const railTile = tiles.get(gridKey)
				if (i > 0 && railTile?.rail) {
					// Check if intersecting rail is perpendicular
					if (railTile.rail?.flowMap[stretchDirection] !== undefined) {
						// Invalid direction
						stretchRails.clear()
						validStretch = false
						break
					} else if (i === stretchLength - 1) {
						stretchLength++
					}
				}
				const flowMap: Directions[] = []
				if (i === 0 && !firstStretch) {
					// Make first tile match previous tile direction
					flowMap[stretchDirection] = reverseDirection(prevStretch.direction)
					flowMap[reverseDirection(prevStretch.direction)] = stretchDirection
				} else {
					flowMap[stretchDirection] = reverseDirection(stretchDirection)
					flowMap[reverseDirection(stretchDirection)] = stretchDirection
				}
				const booster = firstStretch && i === 0
				stretchRails.set(gridKey, { x, y, flowMap, booster })
			}
		} while (!validStretch && possibleDirections.length > 0)
		if (!validStretch) {
			// No valid stretch could be created
			return false
		} else {
			// Create room for stretch
			const roomBreadth =
				firstStretch || finalStretch ? 5 : getUpperNormal(5, 3)
			const roomLength = firstStretch
				? 5
				: finalStretch
				? 8
				: getUpperNormal(3, stretchLength / 2, stretchLength)
			const roomOffset = firstStretch
				? 0
				: finalStretch
				? 2
				: RNG.getUniformInt(
						-Math.floor(roomBreadth / 2),
						Math.floor(roomBreadth / 2)
				  )
			const roomCenter = addGrids(
				startGrid,
				moveDirectional(
					stretchDirection,
					firstStretch
						? 0
						: finalStretch
						? stretchLength - 4
						: RNG.getUniformInt(0, stretchLength),
					-roomOffset
				)
			)
			const room = createRoom(
				roomCenter,
				isVertical(stretchDirection) ? roomBreadth : roomLength,
				isVertical(stretchDirection) ? roomLength : roomBreadth
			)
			room.tiles.forEach((roomTile) => {
				if (tiles.has(roomTile.x + ':' + roomTile.y)) return
				if (
					stretches[0] &&
					Math.abs(stretches[0].startGrid.x - roomTile.x) < 4 &&
					Math.abs(stretches[0].startGrid.y - roomTile.y) < 4
				) {
					// Don't allow rooms near starting room
					return
				}
				tiles.set(roomTile.x + ':' + roomTile.y, roomTile)
			})
			// Add rail tiles to map
			// Doing this after room gen so floor tiles get overwritten
			stretchRails.forEach((railTile, gridKey) => {
				let tile = createRailTile(railTile.x, railTile.y, railTile)
				const existingRailTile =
					!equalGrid(railTile, startGrid) && tiles.get(gridKey)
				if (existingRailTile && existingRailTile.rail) {
					tile.rail!.flowMap = [1, 0, 3, 2]
				}
				tiles.set(gridKey, tile)
			})
			// Add stretch to stretches
			const stretch = {
				direction: stretchDirection,
				possibleDirections,
				startGrid,
				endGrid: addGrids(
					startGrid,
					moveDirectional(stretchDirection, stretchLength - 1)
				),
				rails: stretchRails,
				length: stretchLength,
				room,
			}
			stretches.push(stretch)
			rooms.push(stretch.room)
		}
		totalMainlineLength += stretchLength
	} while (!finalStretch)
	// Wall it up
	tiles.forEach((tile) => {
		if (tile.type === Tile.Wall) return
		getNeighbors(tile, true).forEach(({ x, y }) => {
			const gridKey = x + ':' + y
			if (!tiles.has(gridKey)) tiles.set(gridKey, createWallTile(x, y))
		})
	})
	return { tiles, stretches, rooms }
}

function createRoom(center: Grid, width: number, height: number) {
	const roomTiles: TileData[] = []
	let x1, x2, y1, y2
	for (let rw = 0; rw < width; rw++) {
		for (let rh = 0; rh < height; rh++) {
			const { x, y } = addGrids(center, {
				x: rw - Math.floor(width / 2),
				y: rh - Math.floor(height / 2),
			})
			x1 = x < x1 ? x : x1 ?? x
			x2 = x > x2 ? x : x2 ?? x
			y1 = y < y1 ? y : y1 ?? y
			y2 = y > y2 ? y : y2 ?? y
			roomTiles.push(createFloorTile(x, y))
		}
	}
	return { width, height, tiles: roomTiles, x1, x2, y1, y2 }
}
