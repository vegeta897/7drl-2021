import { RNG } from 'rot-js'
import { Tile, TileData } from '../core/level'
import { Directions, Grid } from '../types'
import {
	addGrids,
	checkCollisionInRadius,
	getNeighbors,
	getNormalWithMin,
	moveDirectional,
	reverseDirection,
	TileMap,
	turnClockwise,
} from '../util'
import { RailData, RailSegment, Room } from './types'
import { createFloorTile, createRailTile, createWallTile } from './util'
import { getTutorialRoom } from './tutorial'

const TARGET_TOTAL_LENGTH = 300
const FIRST_SEGMENT_LENGTH = 150
const MIN_SEGMENT_LENGTH = 3

export default class MainLine {
	valid: boolean
	abort = false
	attempts = 0
	rooms: Room[]
	tiles = new TileMap()
	segments: RailSegment[]
	totalLength: number
	complete = false
	currentGrid: Grid
	playerStart: Grid
	generate() {
		if (this.attempts++ > 100) return (this.abort = true)
		console.log(`######## begin level gen attempt ${this.attempts} #########`)
		this.rooms = []
		this.tiles.data.clear()
		this.segments = []
		this.totalLength = 0
		this.currentGrid = { x: 0, y: 0 }
		this.valid = true
		// Create first segment
		const firstSegment = this.runRail(Directions.Right, FIRST_SEGMENT_LENGTH)
		if (!firstSegment) {
			this.generate()
			return
		}
		const mergeDistance = 20
		this.commitRail(firstSegment)
		// Create boosted merge rail
		const mergeTile = firstSegment.railTiles[mergeDistance]
		mergeTile.rail!.flowMap[Directions.Up] = Directions.Right
		for (let i = 1; i < 4; i++) {
			this.tiles.addTile(
				createRailTile(mergeTile.x, mergeTile.y + i, {
					flowMap:
						i === 3
							? [Directions.Up, Directions.Up, Directions.Up, Directions.Up]
							: [Directions.Up, Directions.Down],
					booster: i === 3,
				})
			)
		}
		this.playerStart = { x: mergeDistance + 11, y: 22 }
		const tutorialRoom = getTutorialRoom(mergeDistance - 4, 4)
		this.commitRoom(tutorialRoom)
		// Add intermediate segments
		do {
			const prevSegment = this.segments[this.segments.length - 1]
			const possibleDirections = [
				turnClockwise(prevSegment.direction),
				turnClockwise(prevSegment.direction, 3),
			]
			if (RNG.getUniform() > 0.5) possibleDirections.reverse()
			possibleDirections.unshift(prevSegment.direction)
			let segment
			do {
				const direction = possibleDirections.pop()!
				const segmentLength = getNormalWithMin(
					MIN_SEGMENT_LENGTH * 2,
					MIN_SEGMENT_LENGTH
				)
				let lastTileCheck
				if (this.totalLength + segmentLength >= TARGET_TOTAL_LENGTH) {
					lastTileCheck = (x, y) =>
						!checkCollisionInRadius([...this.tiles.data.values()], { x, y }, 5)
				}
				segment = this.runRail(direction, segmentLength, lastTileCheck)
			} while (!segment && possibleDirections.length > 0)
			if (!segment) {
				this.generate()
				return
			}
			const room = this.createRoom(
				addGrids(
					segment.startGrid,
					moveDirectional(
						segment.direction,
						RNG.getUniformInt(0, segment.length)
					)
				),
				5,
				5
			)
			this.commitRoom(room)
			this.commitRail(segment)
			this.complete = this.totalLength >= TARGET_TOTAL_LENGTH
		} while (!this.complete)
		// Set last tile of final segment to booster
		const finalSegment = this.segments[this.segments.length - 1]
		const finalSegmentTile =
			finalSegment.railTiles[finalSegment.railTiles.length - 1]
		finalSegmentTile.rail!.booster = true
		const boostDirection = reverseDirection(finalSegment.direction)
		finalSegmentTile.rail!.flowMap = [
			boostDirection,
			boostDirection,
			boostDirection,
			boostDirection,
		]
		this.commitRoom(this.createRoom(finalSegmentTile, 7, 7))
		// Wall it up
		this.tiles.data.forEach((tile) => {
			if (tile.type === Tile.Wall) return
			getNeighbors(tile, true).forEach(({ x, y }) => {
				if (!this.tiles.has(x, y)) this.tiles.addTile(createWallTile(x, y))
			})
		})
	}
	runRail(
		railDir: Directions,
		railLength: number,
		lastTileCheck?: (x, y) => boolean
	): RailSegment | false {
		const railTiles: TileData[] = []
		const prevSegment = this.segments[this.segments.length - 1]
		const railStartGrid = { ...this.currentGrid }
		for (let i = 0; i < railLength; i++) {
			const { x, y } = addGrids(railStartGrid, moveDirectional(railDir, i))
			const railTile = this.tiles.get(x, y)
			const flowMap: RailData['flowMap'] = []
			flowMap[railDir] = railDir
			flowMap[reverseDirection(railDir)] = reverseDirection(railDir)
			if (railTile?.rail) {
				if (i === 0) {
					// Last tile of previous rail, update flow map
					flowMap[railDir] = undefined
					flowMap[reverseDirection(railDir)] = reverseDirection(
						prevSegment.direction
					)
					flowMap[prevSegment.direction] = railDir
				} else {
					if (
						railTile.rail.flowMap[railDir] !== undefined ||
						railTile.rail.flowMap[reverseDirection(railDir)] !== undefined
					) {
						// Can't cross this rail
						break
					} else {
						// Can intersect, update flow map
						flowMap[turnClockwise(railDir)] = turnClockwise(railDir)
						flowMap[turnClockwise(railDir, 3)] = turnClockwise(railDir, 3)
						if (i === railLength - 1) {
							// Extend past intersection
							railLength++
						}
					}
				}
			}
			if (i === railLength - 1 && lastTileCheck && !lastTileCheck(x, y)) {
				if (railLength > FIRST_SEGMENT_LENGTH / 2) return false
				// Extend to satisfy last-tile check
				railLength++
			}
			railTiles.push(createRailTile(x, y, { flowMap, booster: false }))
		}
		if (railTiles.length < railLength) {
			// RailSegment failed
			return false
		} else {
			return {
				direction: railDir,
				startGrid: railStartGrid,
				railTiles,
				length: railLength,
				rooms: [],
			}
		}
	}
	commitRail(rail: RailSegment) {
		this.segments.push(rail)
		rail.railTiles.forEach((railTile) => {
			this.tiles.addTile(railTile)
		})
		this.currentGrid = addGrids(
			rail.startGrid,
			moveDirectional(rail.direction, rail.length - 1)
		)
		this.totalLength += rail.length
	}
	createRoom(center: Grid, width: number, height: number): Room {
		const halfWidth = Math.floor(width / 2)
		const halfHeight = Math.floor(height / 2)
		let x1, x2, y1, y2
		const tiles = new TileMap()
		for (let x = center.x - halfWidth; x < center.x + halfWidth + 1; x++) {
			for (let y = center.y - halfHeight; y < center.y + halfHeight + 1; y++) {
				const floorTile = createFloorTile(x, y)
				tiles.set(x, y, floorTile)
				x1 = x < x1 ? x : x1 ?? x
				x2 = x > x2 ? x : x2 ?? x
				y1 = y < y1 ? y : y1 ?? y
				y2 = y > y2 ? y : y2 ?? y
			}
		}
		return { x1, x2, y1, y2, width, height, tiles }
	}
	commitRoom(room: Room) {
		room.tiles.data.forEach((tile, key) => {
			if (this.tiles.data.has(key)) return
			this.tiles.data.set(key, tile)
		})
		this.rooms.push(room)
	}
	constructor() {
		while (!this.valid && !this.abort) {
			this.generate()
		}
		console.log('mainline generated in', this.attempts, 'attempts')
	}
}
