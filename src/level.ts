import * as rotJS from 'rot-js'
import { Container } from 'pixi.js'
import { createSprite, SPRITES } from './sprites'
import Dungeon from 'rot-js/lib/map/dungeon'
import { TILE_SIZE } from './systems/sys_tile'

export class Level {
	container = new Container()
	map: Dungeon
	constructor(width = 40, height = 30) {
		this.map = new rotJS.Map.Digger(width, height, { dugPercentage: 0.3 })
		this.map.create((x, y, value) => {
			if (value === 1) {
				const wall = createSprite(SPRITES.WALL)
				wall.x = x * TILE_SIZE
				wall.y = y * TILE_SIZE
				wall.tint = 0x383020
				this.container.addChild(wall)
			}
		})
	}
}
