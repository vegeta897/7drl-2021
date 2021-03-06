import * as rotJS from 'rot-js'
import { Container } from 'pixi.js'
import { createSprite, SPRITES } from './sprites'
import Dungeon from 'rot-js/lib/map/dungeon'
import { TILE_SIZE } from './'

export class Level {
	container = new Container()
	map: Dungeon
	data = new Map()
	constructor(width = 80, height = 16) {
		this.map = new rotJS.Map.Uniform(width, height, {
			roomDugPercentage: 0.7,
			roomWidth: [8, 20],
			roomHeight: [6, 12],
		})
		this.map.create((x, y, value) => {
			const grid = {
				value,
				sprite: createSprite(value === 1 ? SPRITES.WALL : SPRITES.FLOOR),
			}
			grid.sprite.x = x * TILE_SIZE
			grid.sprite.y = y * TILE_SIZE
			grid.sprite.tint = value === 1 ? 0x383020 : 0x141000
			grid.sprite.alpha = 0
			this.container.addChild(grid.sprite)
			this.data.set(x + ':' + y, grid)
		})
	}
}
