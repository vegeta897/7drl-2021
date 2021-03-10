import { RNG } from 'rot-js'
import { Tile, TileData } from '../level'
import { Directions, Grid } from '../types'
import {
	addGrids,
	equalGrid,
	getDirections,
	getNeighbors,
	getUpperNormal,
	moveDirectional,
	reverseDirection,
} from '../util'
import { RailData, Room, Stretch, Tints } from './types'
import {
	createFloorTile,
	createRailTile,
	createWallTile,
	getLinkage,
} from './util'

const DEBUG_RAIL = false
const DEBUG_COLORS = false

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
		let stretchLength = !prevStretch
			? 20
			: getUpperNormal(minStretchLength, stretchLengthStdDev)
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
				if (
					prevStretch &&
					Math.abs(stretches[0].startGrid.x - x) < 4 &&
					Math.abs(stretches[0].startGrid.y - y)
				) {
					// Don't allow rails near starting rail
					validStretch = false
					break
				}
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
				const booster = !prevStretch && i === 0
				stretchRails.set(gridKey, { x, y, linkage, directions, booster })
			}
		} while (!validStretch && possibleDirections.length > 0)
		if (!validStretch) {
			// No valid stretch could be created
			return false
		} else {
			// Create room for stretch
			const roomCenterDistance = !prevStretch
				? 0
				: finalStretch
				? stretchLength - 4
				: getUpperNormal(1, stretchLength / 2, stretchLength - 2)
			addGrids(startGrid, moveDirectional(stretchDirection, roomCenterDistance))
			const roomBreadth =
				!prevStretch || finalStretch ? 5 : getUpperNormal(5, 3)
			const roomLength = !prevStretch
				? 5
				: finalStretch
				? 8
				: getUpperNormal(3, stretchLength / 2, stretchLength)
			const roomOffset = !prevStretch
				? 2
				: finalStretch
				? 5
				: RNG.getUniformInt(0, roomBreadth)
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
					const roomTile = createFloorTile(x, y)
					if (DEBUG_COLORS)
						roomTile.tint = Tints[stretches.length % Tints.length]
					roomTiles.push(roomTile)
					tiles.set(x + ':' + y, roomTile)
				}
			}
			// Add rail tiles to map
			stretchRails.forEach((railTile, gridKey) => {
				let tile = createRailTile(railTile.x, railTile.y, railTile)
				const existingRailTile =
					!equalGrid(railTile, startGrid) && tiles.get(gridKey)
				if (existingRailTile && existingRailTile.rail) {
					tile.rail!.directions = getDirections()
					tile.rail!.linkage = 0b1111
					// TODO Should be able to remove this line
					tile.rail!.booster = existingRailTile.rail.booster
				}
				if (DEBUG_COLORS) tile.tint = Tints[stretches.length % Tints.length]
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
				room: {
					width: x2 - x1,
					height: y2 - y1,
					tiles: roomTiles,
					x1,
					x2,
					y1,
					y2,
				},
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
	if (!DEBUG_RAIL) {
		// New meta, don't remove tiles
		// stretches.forEach((stretch, stretchNum) => {
		// 	// Try to remove a tile from each stretch
		// 	if (stretchNum === stretches.length - 1) return
		// 	const stretchRails = new Map([...stretch.rails])
		// 	do {
		// 		const [gridKey, tile] = RNG.getItem([...stretchRails])!
		// 		stretchRails.delete(gridKey)
		// 		if (
		// 			!getNeighbors(tile).some(
		// 				(t) => tiles.get(t.x + ':' + t.y)?.type === Tile.Floor
		// 			)
		// 		)
		// 			continue
		// 		const railTile = tiles.get(gridKey)
		// 		if (!railTile || !railTile.rail) continue
		// 		if ([0b0011, 0b1100].includes(railTile.rail.linkage)) {
		// 			tiles.set(gridKey, createFloorTile(railTile!.x, railTile!.y))
		// 			break
		// 		}
		// 	} while (stretchRails.size > 0)
		// })
	}
	return { tiles, stretches, rooms }
}
