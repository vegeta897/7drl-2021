import { RNG } from 'rot-js'
import { TileData } from '../level'
import { Grid } from '../types'
import {
	addGrids,
	equalGrid,
	getDirections,
	getUpperNormal,
	moveDirectional,
	reverseDirection,
} from '../util'
import { RailData, Stretch, Tints } from './types'
import { createRailTile, getLinkage } from './util'

const crossLinkages = [0b1100, 0b1100, 0b0011, 0b0011]
const directionNames = ['Up', 'Down', 'Left', 'Right']

// TODO: Encourage turning in on itself a few times, and then striking out

export function createMainline(): Map<string, TileData> {
	const targetMainlineLength = 200
	const minRoomSize = 5 // NOT including walls
	const targetRoomSize = 8
	const railTiles: Map<string, TileData> = new Map()
	const stretches: Set<Stretch> = new Set()
	let totalMainlineLength = 0
	do {
		console.log('##################################################')
		const prevStretch = [...stretches].pop()
		const startGrid: Grid = prevStretch?.endGrid || { x: 0, y: 0 }
		const possibleDirections = getDirections(
			prevStretch
				? [prevStretch.direction, reverseDirection(prevStretch.direction)]
				: []
		)
		// TODO: Try extending stretch if valid direction not found
		const stretchLength = getUpperNormal(minRoomSize, targetRoomSize / 2)
		let validStretch
		let stretchDirection
		const stretchRailTiles: Map<string, Grid & RailData> = new Map()
		console.log('creating stretch at', startGrid, 'with length', stretchLength)
		do {
			validStretch = true
			stretchDirection = RNG.getItem(possibleDirections)!
			console.log('trying direction:', directionNames[stretchDirection])
			possibleDirections.splice(possibleDirections.indexOf(stretchDirection), 1)
			// Check full rail path is clear
			for (let i = 0; i < stretchLength; i++) {
				const { x, y } = addGrids(
					startGrid,
					moveDirectional(stretchDirection, i)
				)
				const gridKey = x + ':' + y
				const railTile = railTiles.get(gridKey)
				if (railTile) console.log('rail tile collision', railTile)
				if (
					railTile &&
					i > 0 &&
					(i === stretchLength - 1 ||
						railTile.rail?.linkage !== crossLinkages[stretchDirection])
				) {
					// Invalid direction
					console.log('invalid direction')
					stretchRailTiles.clear()
					validStretch = false
					break
				}
				// Update linkage of first tile
				let linkage, directions
				if (i === 0 && prevStretch) {
					directions = [
						stretchDirection,
						reverseDirection(prevStretch.direction),
					]
					linkage = getLinkage(directions)
				} else {
					directions = [stretchDirection, reverseDirection(stretchDirection)]
					linkage = getLinkage(directions)
				}
				stretchRailTiles.set(gridKey, { x, y, linkage, directions })
			}
		} while (!validStretch && possibleDirections.length > 0)
		if (!validStretch) {
			// No valid stretch could be created
			console.log('no valid stretch could be created, aborting mainline')
			break
		} else {
			// Add rail tiles to map
			console.log('stretch valid, creating tiles')
			stretchRailTiles.forEach((railTile, gridKey) => {
				const tile = createRailTile(railTile.x, railTile.y, railTile)
				const existingRailTile =
					!equalGrid(railTile, startGrid) && railTiles.get(gridKey)
				if (existingRailTile) {
					tile.rail!.directions = getDirections()
					tile.rail!.linkage = 0b1111
				}
				tile.tint = Tints[stretches.size % Tints.length]
				railTiles.set(gridKey, tile)
			})
			// Add stretch to stretches
			stretches.add({
				direction: stretchDirection,
				possibleDirections,
				startGrid,
				endGrid: addGrids(
					startGrid,
					moveDirectional(stretchDirection, stretchLength - 1)
				),
				length: stretchLength,
			})
		}
		totalMainlineLength += stretchLength
	} while (totalMainlineLength < targetMainlineLength)
	return railTiles
}

// export function createMainlineOld(level: Level) {
// 	// TODO: Rooms include walls. Mainline rail will overwrite walls after rooms.
// 	// Adjacent rooms will have a double wall, deal with it
//
// 	// TODO: Allow rooms and rails to overlap. The player still has to fill all the rail gaps to complete the floor. Just make sure short circuits aren't created
//
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
// 				if (level.data.has(x + ':' + y)) {
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
// 						level.data.has(x + ':' + y)
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
// 						level.data.set(
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
// 				level.data.set(x + ':' + y, railTile)
// 			}
// 		} else {
// 			console.log('invalid stretch')
// 		}
// 	}
// }
