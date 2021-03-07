import * as rotJS from 'rot-js'
import { Container, Sprite } from 'pixi.js'
import { createSprite, TextureName } from './sprites'
import Dungeon from 'rot-js/lib/map/dungeon'
import { TILE_SIZE } from './'
import { createRails, RailTile } from './rail'

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
	rail?: RailTile
}

export class Level {
	container = new Container()
	dungeon: Dungeon
	data: Map<string, TileData> = new Map()
	constructor(width = 80, height = 16) {
		rotJS.RNG.setSeed(897)
		this.dungeon = new rotJS.Map.Uniform(width, height, {
			roomDugPercentage: 0.7,
			roomWidth: [8, 20],
			roomHeight: [6, 12],
		})
		this.dungeon.create((x, y, value) => {
			this.data.set(x + ':' + y, {
				x,
				y,
				type: value,
				seeThrough: value !== Tile.Wall,
			})
		})
		createRails(this)
		this.data.forEach((tile) => {
			let tint = 0x141000
			let texture = TextureName.Floor
			if (tile.type === Tile.Rail) {
				texture = TextureName.RailCross
				switch (tile.rail!.variation) {
					case 0b0001:
					case 0b0010:
					case 0b0011:
						texture = TextureName.RailUpDown
						break
					case 0b0100:
					case 0b1000:
					case 0b1100:
						texture = TextureName.RailLeftRight
						break
					case 0b0101:
						texture = TextureName.RailUpLeft
						break
					case 0b0110:
						texture = TextureName.RailDownLeft
						break
					case 0b1001:
						texture = TextureName.RailUpRight
						break
					case 0b1010:
						texture = TextureName.RailDownRight
						break
				}
				tint = 0x303048
			} else if (tile.type === Tile.Wall) {
				texture = TextureName.Wall
				tint = 0x383020
			}
			tile.sprite = createSprite(texture)
			tile.sprite.x = tile.x * TILE_SIZE
			tile.sprite.y = tile.y * TILE_SIZE
			tile.sprite.alpha = 0
			tile.sprite.tint = tint
			this.container.addChild(tile.sprite)
		})
	}
	getTileAt(x: number, y: number): TileData | undefined {
		return this.data.get(x + ':' + y)
	}
}
