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
import { RailData, RailSegment, Room, TileCheck } from './types'
import {
	createFloorTile,
	createRailTile,
	createWallTile,
	getFlowMapFromTextureID,
} from './util'
import { getTutorialRoom } from './tutorial'
import { TextureID } from '../core/sprites'

const MAINLINE_DIRECTION = Directions.Right
const FIRST_SEGMENT_LENGTH = 130
const TARGET_TOTAL_LENGTH = FIRST_SEGMENT_LENGTH + 500
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
		this.rooms = []
		this.tiles.data.clear()
		this.segments = []
		this.totalLength = 0
		this.currentGrid = { x: 0, y: 0 }
		this.valid = true
		// Create first segment
		const firstSegment = this.runRail(MAINLINE_DIRECTION, FIRST_SEGMENT_LENGTH)
		if (!firstSegment) return this.generate()

		this.commitRail(firstSegment)
		// Create boosted merge rail
		const mergeDistance = 80
		this.playerStart = { x: mergeDistance + 7, y: 22 }
		// this.playerStart = { x: 250, y: 0 }
		const mergeTile = firstSegment.railTiles[mergeDistance]
		mergeTile.rail!.flowMap[Directions.Up] = Directions.Right
		for (let i = 1; i < 4; i++) {
			this.tiles.addTile(
				createRailTile(mergeTile.x, mergeTile.y + i, {
					flowMap:
						i === 3
							? [Directions.Up, Directions.Up, Directions.Up, Directions.Up]
							: getFlowMapFromTextureID(TextureID.RailUpDown),
					booster: i === 3,
				})
			)
		}
		// Create tutorial room
		const tutorialRoom = getTutorialRoom(mergeDistance - 6, 4)
		this.commitRoom(tutorialRoom)

		// Add intermediate segments
		do {
			const prevSegment = this.segments[this.segments.length - 1]
			const possibleDirections = [
				turnClockwise(prevSegment.direction),
				turnClockwise(prevSegment.direction, 3),
			]
			if (RNG.getUniform() > 0.6) {
				// Prioritize moving away from start
				if (possibleDirections[0] === MAINLINE_DIRECTION)
					possibleDirections.reverse()
			} else if (RNG.getUniform() > 0.5) possibleDirections.reverse()

			possibleDirections.unshift(prevSegment.direction)
			let segment
			do {
				const direction = possibleDirections.pop()!
				const segmentLength = getNormalWithMin(
					MIN_SEGMENT_LENGTH * 2,
					MIN_SEGMENT_LENGTH
				)
				let tileCheck: TileCheck = (x, y, lastTile) => ({
					cancel: x < FIRST_SEGMENT_LENGTH - 1,
				})
				if (
					direction === MAINLINE_DIRECTION &&
					this.totalLength + segmentLength >= TARGET_TOTAL_LENGTH
				) {
					tileCheck = (x, y, lastTile) => ({
						extend:
							lastTile &&
							checkCollisionInRadius(
								[...this.tiles.data.values()],
								{ x, y },
								12
							),
					})
				}
				segment = this.runRail(direction, segmentLength, tileCheck)
			} while (!segment && possibleDirections.length > 0)
			if (!segment) return this.generate()
			// Create dungeon turn-off rail
			if (this.segments.length === 1) {
				const turnoffTile = segment.railTiles[0]
				turnoffTile.rail!.flowMap[Directions.Left] = Directions.Left
				turnoffTile.rail!.flowMap[Directions.Right] = Directions.Right
				for (let i = 0; i < 6; i++) {
					this.tiles.addTile(
						createRailTile(turnoffTile.x + 1 + i, turnoffTile.y, {
							flowMap: getFlowMapFromTextureID(TextureID.RailLeftRight),
						})
					)
				}
				this.commitRoom(
					this.createRoom({ ...turnoffTile, x: turnoffTile.x + 2 }, 8, 3)
				)
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
			this.complete =
				this.totalLength >= TARGET_TOTAL_LENGTH &&
				segment.direction === MAINLINE_DIRECTION
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
			if (tile.type === Tile.Wall || tile.type === Tile.HoldShift) return
			getNeighbors(tile, true).forEach(({ x, y }) => {
				if (!this.tiles.has(x, y)) this.tiles.addTile(createWallTile(x, y))
			})
		})
	}
	runRail(
		railDir: Directions,
		railLength: number,
		tileCheck?: TileCheck
	): RailSegment | false {
		const railTiles: TileData[] = []
		const prevSegment = this.segments[this.segments.length - 1]
		const railStartGrid = { ...this.currentGrid }
		for (let i = 0; i < railLength; i++) {
			const { x, y } = addGrids(railStartGrid, moveDirectional(railDir, i))
			let lastTile = i === railLength - 1
			const checkedTile = tileCheck && tileCheck(x, y, lastTile)
			if (checkedTile?.cancel) return false
			if (checkedTile?.extend) {
				railLength++
				lastTile = false
			}
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
						// Extend past intersection if not too long
						if (lastTile && railLength++ > FIRST_SEGMENT_LENGTH / 4)
							return false
					}
				}
			}
			railTiles.push(createRailTile(x, y, { flowMap }))
		}
		if (railTiles.length < railLength) {
			// Segment failed
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
	commitRail(segment: RailSegment) {
		this.segments.push(segment)
		segment.railTiles.forEach((railTile) => {
			this.tiles.addTile(railTile)
		})
		this.currentGrid = addGrids(
			segment.startGrid,
			moveDirectional(segment.direction, segment.length - 1)
		)
		this.totalLength += segment.length
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
