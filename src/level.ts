import * as rotJS from 'rot-js'
import { Container, Sprite } from 'pixi.js'
import { createSprite, TextureID } from './sprites'
import { TILE_SIZE } from './'
import { createMainline } from './rail/rail'
import { Grid } from './types'
import { RailData, Room } from './rail/types'

const RANDOM_SEED = true
const SEED = !RANDOM_SEED ? 23 : rotJS.RNG.getUniformInt(0, 0xffffff)
const DEBUG_VISIBILITY = false

export enum Tile {
	Floor,
	Wall,
	Rail,
}

export type TileData = {
	sprite?: Sprite
	x: number
	y: number
	type: Tile
	seeThrough: boolean
	rail?: RailData
	tint?: number
	revealed: number
}

export class Level {
	container = new Container()
	levelStart: Grid
	rooms: Room[]
	tiles: Map<string, TileData> = new Map()
	constructor(worldSprites: Set<Sprite>) {
		rotJS.RNG.setSeed(SEED)
		console.time('Level generation')
		let mainLine
		let attempts = 0
		do {
			attempts++
			mainLine = createMainline()
		} while (!mainLine)
		console.log('Level generated in', attempts, 'attempts')
		mainLine.tiles.forEach((railTile, gridKey) =>
			this.tiles.set(gridKey, railTile)
		)
		this.rooms = mainLine.rooms
		const finalRoom = mainLine.rooms[mainLine.rooms.length - 1]
		this.levelStart = {
			x: finalRoom.x1 + Math.floor(finalRoom.width / 2),
			y: finalRoom.y1 + Math.floor(finalRoom.height / 2),
		}
		console.timeEnd('Level generation')
		console.time('Sprite creation')
		this.tiles.forEach((tile) => {
			let tint = 0x3e2137 // Floor
			let texture = TextureID.Floor
			if (tile.type === Tile.Rail) {
				texture = TextureID.RailCross
				switch (tile.rail!.linkage) {
					case 0b0001:
					case 0b0010:
					case 0b0011:
						texture = TextureID.RailUpDown
						break
					case 0b0100:
					case 0b1000:
					case 0b1100:
						texture = TextureID.RailLeftRight
						break
					case 0b0101:
						texture = TextureID.RailUpLeft
						break
					case 0b1001:
						texture = TextureID.RailUpRight
						break
					case 0b0110:
						texture = TextureID.RailDownLeft
						break
					case 0b1010:
						texture = TextureID.RailDownRight
						break
					case 0b0111:
						texture = TextureID.RailUpDownLeft
						break
					case 0b1011:
						texture = TextureID.RailUpDownRight
						break
					case 0b1101:
						texture = TextureID.RailUpLeftRight
						break
					case 0b1110:
						texture = TextureID.RailDownLeftRight
						break
				}
				tint = tile.rail!.booster ? 0xbf1d30 : 0x9a6348
			} else if (tile.type === Tile.Wall) {
				texture = TextureID.Wall
				tint = 0x584563
			}
			tile.sprite = createSprite(texture)
			tile.sprite.x = tile.x * TILE_SIZE
			tile.sprite.y = tile.y * TILE_SIZE
			if (!DEBUG_VISIBILITY) tile.sprite.alpha = 0
			tile.sprite.tint = tile.tint ?? tint
			this.container.addChild(tile.sprite)
			worldSprites.add(tile.sprite)
		})
		console.timeEnd('Sprite creation')
	}
	getTileAt(grid: Grid): TileData | undefined {
		return this.tiles.get(grid.x + ':' + grid.y)
	}
}
