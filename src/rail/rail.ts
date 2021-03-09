import { RNG } from 'rot-js'
import { TileData } from '../level'
import { Directions, Grid } from '../types'
import {
	addGrids,
	equalGrid,
	getDirections,
	getUpperNormal,
	moveDirectional,
	reverseDirection,
} from '../util'
import { RailData, Room, Stretch, Tints } from './types'
import { createFloorTile, createRailTile, getLinkage } from './util'

const REMOVE_RAILS = false

const crossLinkages = [0b1100, 0b1100, 0b0011, 0b0011]
// const directionNames = ['Up', 'Down', 'Left', 'Right']

export function createMainline():
	| { tiles: Map<string, TileData>; stretches: Stretch[]; rooms: Room[] }
	| false {
	const targetMainlineLength = 150
	const minStretchLength = 7 // NOT including walls
	const stretchLengthStdDev = 4
	const tiles: Map<string, TileData> = new Map()
	const stretches: Stretch[] = []
	const rooms: Room[] = []
	let totalMainlineLength = 0
	let finalStretch = false
	do {
		const prevStretch = stretches[stretches.length - 1]
		const startGrid: Grid = prevStretch?.endGrid || { x: 0, y: 0 }
		let stretchLength = getUpperNormal(minStretchLength, stretchLengthStdDev)
		const possibleDirections = getDirections(
			prevStretch
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
		const stretchRails: Map<string, Grid & RailData> = new Map()
		do {
			validStretch = true
			stretchDirection = RNG.getItem(possibleDirections)!
			possibleDirections.splice(possibleDirections.indexOf(stretchDirection), 1)
			// Check full rail path is clear
			for (let i = 0; i < stretchLength; i++) {
				const { x, y } = addGrids(
					startGrid,
					moveDirectional(stretchDirection, i)
				)
				const gridKey = x + ':' + y
				const railTile = tiles.get(gridKey)
				if (i > 0 && railTile?.rail) {
					// Check if intersecting rail is perpendicular
					if (railTile.rail?.linkage !== crossLinkages[stretchDirection]) {
						// Invalid direction
						stretchRails.clear()
						validStretch = false
						break
					} else if (i === stretchLength - 1) {
						stretchLength++
					}
				}
				let linkage, directions
				if (i === 0 && prevStretch) {
					// Make first tile match previous tile direction
					directions = [
						stretchDirection,
						reverseDirection(prevStretch.direction),
					]
					linkage = getLinkage(directions)
				} else {
					directions = [stretchDirection, reverseDirection(stretchDirection)]
					linkage = getLinkage(directions)
				}
				stretchRails.set(gridKey, { x, y, linkage, directions })
			}
		} while (!validStretch && possibleDirections.length > 0)
		if (!validStretch) {
			// No valid stretch could be created
			return false
		} else {
			// Create room for stretch
			const roomCenterDistance = finalStretch
				? stretchLength - 4
				: getUpperNormal(1, stretchLength / 2, stretchLength - 2)
			addGrids(startGrid, moveDirectional(stretchDirection, roomCenterDistance))
			const roomBreadth = finalStretch ? 5 : getUpperNormal(5, 3)
			const roomLength = finalStretch
				? 8
				: getUpperNormal(3, stretchLength / 2, stretchLength)
			const roomOffset = finalStretch ? 5 : RNG.getUniformInt(0, roomBreadth)
			const roomTiles: TileData[] = []
			let x1, x2, y1, y2
			for (let rw = 0; rw < roomBreadth; rw++) {
				for (let rl = 0; rl < roomLength; rl++) {
					const { x, y } = addGrids(
						startGrid,
						moveDirectional(
							stretchDirection,
							rl + roomCenterDistance - Math.floor(roomLength / 2),
							rw - roomOffset
						)
					)
					x1 = x < x1 ? x : x1 ?? x
					x2 = x > x2 ? x : x2 ?? x
					y1 = y < y1 ? y : y1 ?? y
					y2 = y > y2 ? y : y2 ?? y
					if (tiles.has(x + ':' + y)) continue
					const roomTile = createFloorTile(x, y, stretches.length)
					roomTiles.push(roomTile)
					tiles.set(x + ':' + y, roomTile)
				}
			}
			const room = {
				width: x2 - x1,
				height: y2 - y1,
				tiles: roomTiles,
				x1,
				x2,
				y1,
				y2,
			}
			rooms.push(room)
			// Add rail tiles to map
			stretchRails.forEach((railTile, gridKey) => {
				let tile = createRailTile(railTile.x, railTile.y, railTile)
				const existingRailTile =
					!equalGrid(railTile, startGrid) && tiles.get(gridKey)
				if (existingRailTile && existingRailTile.rail) {
					tile.rail!.directions = getDirections()
					tile.rail!.linkage = 0b1111
				}
				tile.tint = Tints[stretches.length % Tints.length]
				tiles.set(gridKey, tile)
			})
			// Add stretch to stretches
			stretches.push({
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
			})
		}
		totalMainlineLength += stretchLength
	} while (!finalStretch)
	if (REMOVE_RAILS) {
		stretches.forEach((stretch, stretchNum) => {
			// Try to remove a tile from each stretch
			if (stretchNum === stretches.length - 1) return
			const stretchRails = new Map([...stretch.rails])
			do {
				const [gridKey] = RNG.getItem([...stretchRails])!
				stretchRails.delete(gridKey)
				const railTile = tiles.get(gridKey)
				if (!railTile || !railTile.rail) continue
				if ([0b0011, 0b1100].includes(railTile.rail.linkage)) {
					tiles.set(gridKey, createFloorTile(railTile!.x, railTile!.y))
					break
				}
			} while (stretchRails.size > 0)
		})
	}
	return { tiles, stretches, rooms }
}

// export function createMainlineOld(level: Level) {
// 	const TARGET_ROOM_COUNT = 16
// 	const MIN_ROOM_SIZE = 5 // Including walls
// 	const TARGET_ROOM_SIZE = 7
// 	const stretches: Set<Stretch> = new Set()
// 	for (let stretchNum = 0; stretchNum < TARGET_ROOM_COUNT; stretchNum++) {
// 		console.log('#####################################')
// 		// Width and length are relative to the stretch direction
// 		const roomWidth = getNormalWithMin(TARGET_ROOM_SIZE, MIN_ROOM_SIZE)
// 		const roomLength = getNormalWithMin(TARGET_ROOM_SIZE, MIN_ROOM_SIZE)
// 		// Begin stretch
// 		const prevStretch = [...stretches].pop()
// 		const newDirections = getDirections(
// 			prevStretch ? [reverseDirection(prevStretch.direction)] : []
// 		)
// 		const direction = RNG.getItem(newDirections)!
// 		const startGrid = prevStretch?.endGrid
// 			? { ...prevStretch.endGrid }
// 			: { x: 0, y: 0 }
// 		console.log(
// 			'generating stretch',
// 			stretchNum + 1,
// 			'starting at:',
// 			startGrid,
// 			'room width',
// 			roomWidth,
// 			'length',
// 			roomLength
// 		)
// 		const distBeforeRoom = RNG.getUniformInt(0, 8)
// 		const distAfterRoom = RNG.getUniformInt(0, 8)
// 		const stretch: Stretch = {
// 			direction,
// 			possibleDirections: newDirections.filter((dir) => dir !== direction),
// 			startGrid,
// 			distanceBeforeRoom: distBeforeRoom,
// 			distanceAfterRoom: distAfterRoom,
// 			distance: distBeforeRoom + roomLength + distAfterRoom,
// 		}
// 		do {
// 			console.log('direction', stretch.direction)
// 			console.log(
// 				'distance before and after room',
// 				stretch.distanceBeforeRoom,
// 				stretch.distanceAfterRoom
// 			)
// 			// Check full rail path is clear
// 			for (let i = 1; i < stretch.distance; i++) {
// 				const { x, y } = moveDirectional(stretch.direction, i)
// 				if (level.tiles.has(x + ':' + y)) {
// 					// Pick new direction
// 				}
// 			}
// 			// Try to add a room
// 			const validSideOffsets: Grid[][] = []
// 			for (
// 				let sideOffset = -roomWidth + 1;
// 				sideOffset < roomWidth;
// 				sideOffset++
// 			) {
// 				let validSideOffset = true
// 				const sideGrids: Grid[] = []
// 				for (let fwdOff = 0; fwdOff < roomLength; fwdOff++) {
// 					const { x, y } = addGrids(
// 						stretch.startGrid,
// 						moveDirectional(
// 							stretch.direction,
// 							stretch.distanceBeforeRoom + fwdOff,
// 							sideOffset
// 						)
// 					)
// 					if (
// 						(x !== stretch.startGrid.x || y !== stretch.startGrid.y) &&
// 						level.tiles.has(x + ':' + y)
// 					) {
// 						// Room collided with existing tile
// 						validSideOffset = false
// 					} else {
// 						sideGrids.push({ x, y })
// 					}
// 				}
// 				if (validSideOffset) {
// 					// Add side to array
// 					validSideOffsets.push(sideGrids)
// 				} else {
// 					// Reset valid side offsets
// 					validSideOffsets.length = 0
// 				}
// 			}
// 			if (validSideOffsets.length >= roomWidth) {
// 				// Room can be created
// 				console.log(
// 					'room can be created, available offset space',
// 					validSideOffsets.length
// 				)
// 				// Pick a random starting offset
// 				const startOffset = RNG.getUniformInt(
// 					0,
// 					validSideOffsets.length - roomWidth
// 				)
// 				for (let i = startOffset; i < startOffset + roomWidth; i++) {
// 					// Create floor tiles
// 					validSideOffsets[i].forEach((grid) =>
// 						level.tiles.set(
// 							grid.x + ':' + grid.y,
// 							createFloorTile(grid.x, grid.y, stretchNum)
// 						)
// 					)
// 				}
// 				stretch.endGrid = addGrids(
// 					stretch.startGrid,
// 					moveDirectional(stretch.direction, stretch.distance)
// 				)
// 				console.log('stretch distance', stretch.distance)
// 				console.log('set end grid to', stretch.endGrid.x, stretch.endGrid.y)
// 			} else if (stretch.distanceBeforeRoom === roomLength * 2) {
// 				// Room cannot be created in this direction
// 				console.log('room could not be created in this direction')
// 				if (stretch.possibleDirections.length > 0) {
// 					// Pick new direction on this stretch
// 					console.log('pick new direction for stretch')
// 					stretch.direction = RNG.getItem(stretch.possibleDirections)!
// 					stretch.possibleDirections = stretch.possibleDirections.filter(
// 						(dir) => dir !== stretch.direction
// 					)
// 					stretch.distanceBeforeRoom = RNG.getUniformInt(0, 8)
// 					stretch.distance =
// 						stretch.distanceBeforeRoom + roomLength + stretch.distanceAfterRoom
// 				} else {
// 					// We're done with this level
// 					console.log('no previous stretch to fall back to')
// 					break
// 				}
// 			} else {
// 				stretch.distanceBeforeRoom++
// 				stretch.distance++
// 			}
// 		} while (
// 			!stretch.endGrid &&
// 			(stretch.possibleDirections.length > 0 ||
// 				stretch.distanceBeforeRoom < roomLength * 2)
// 		)
// 		if (stretch.endGrid) {
// 			console.log('valid stretch', stretch)
// 			stretches.add(stretch)
// 			// Place rail tiles
// 			for (
// 				let i = 0;
// 				i < stretch.distanceBeforeRoom + roomLength + stretch.distanceAfterRoom;
// 				i++
// 			) {
// 				const { x, y } = addGrids(
// 					stretch.startGrid,
// 					moveDirectional(stretch.direction, i)
// 				)
// 				const railTile = createRailTile(x, y, { directions: [], linkage: 0 })
// 				railTile.tint = Tints[stretchNum % Tints.length]
// 				level.tiles.set(x + ':' + y, railTile)
// 			}
// 		} else {
// 			console.log('invalid stretch')
// 		}
// 	}
// }
