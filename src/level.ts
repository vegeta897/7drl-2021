import * as rotJS from 'rot-js'
import { Container, Sprite } from 'pixi.js'
import { createSprite, TextureID } from './sprites'
import Dungeon from 'rot-js/lib/map/dungeon'
import { TILE_SIZE } from './'
import { createMainline } from './rail/rail'
import { Grid } from './types'
import { RailData } from './rail/types'

const RANDOM_SEED = true
const SEED = RANDOM_SEED ? rotJS.RNG.getUniformInt(0, 0xffffff) : 23
const DEFAULT_WIDTH = 120
const DEFAULT_HEIGHT = 60
// const DUG_PERCENT = 0.8
// const ROOM_WIDTH: [number, number] = [20, 40]
// const ROOM_HEIGHT: [number, number] = [16, 28]
// const CORRIDOR_LENGTH: [number, number] = [1, 3]

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
}

export class Level {
	container = new Container()
	dungeon: Dungeon
	data: Map<string, TileData> = new Map()
	constructor(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
		console.time('Total level generation')
		rotJS.RNG.setSeed(SEED)
		console.time('Room generation')
		// this.dungeon = new rotJS.Map.Digger(width, height, {
		// 	dugPercentage: DUG_PERCENT,
		// 	roomWidth: ROOM_WIDTH,
		// 	roomHeight: ROOM_HEIGHT,
		// 	corridorLength: CORRIDOR_LENGTH,
		// })
		// this.dungeon.create((x, y, value) => {
		// 	this.data.set(x + ':' + y, {
		// 		x,
		// 		y,
		// 		type: value,
		// 		seeThrough: value !== Tile.Wall,
		// 	})
		// })
		console.timeEnd('Room generation')
		console.time('Rail generation')
		createMainline().forEach((railTile, gridKey) =>
			this.data.set(gridKey, railTile)
		)
		console.timeEnd('Rail generation')
		console.time('Sprite creation')
		this.data.forEach((tile) => {
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
				tint = 0x9a6348
			} else if (tile.type === Tile.Wall) {
				texture = TextureID.Wall
				tint = 0x584563
			}
			tile.sprite = createSprite(texture)
			tile.sprite.x = tile.x * TILE_SIZE
			tile.sprite.y = tile.y * TILE_SIZE
			// tile.sprite.alpha = 0
			tile.sprite.tint = tile.tint ?? tint
			this.container.addChild(tile.sprite)
		})
		console.timeEnd('Sprite creation')
		console.timeEnd('Total level generation')
	}
	getTileAt(grid: Grid): TileData | undefined {
		return this.data.get(grid.x + ':' + grid.y)
	}
}
