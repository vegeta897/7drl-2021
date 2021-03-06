import * as rotJS from 'rot-js'
import { Container } from 'pixi.js'
import { createSprite, SPRITES } from './sprites'
import Dungeon from 'rot-js/lib/map/dungeon'
import { TILE_SIZE } from './'

const gridValues = {
	0: SPRITES.Floor,
	1: SPRITES.Wall,
	2: SPRITES.Rail,
}

export class Level {
	container = new Container()
	dungeon: Dungeon
	data = new Map()
	constructor(width = 80, height = 16) {
		rotJS.RNG.setSeed(897)
		this.dungeon = new rotJS.Map.Uniform(width, height, {
			roomDugPercentage: 0.7,
			roomWidth: [8, 20],
			roomHeight: [6, 12],
		})
		this.dungeon.create((x, y, value) => {
			this.data.set(x + ':' + y, { x, y, value })
		})
		const corridors = this.dungeon.getCorridors()
		for (const corridor of corridors) {
			corridor.create((x, y) => {
				this.data.set(x + ':' + y, { x, y, value: 2 })
			})
		}
		this.data.forEach((grid) => {
			grid.sprite = createSprite(gridValues[grid.value])
			grid.sprite.x = grid.x * TILE_SIZE
			grid.sprite.y = grid.y * TILE_SIZE
			grid.sprite.tint =
				grid.value === 2 ? 0x303048 : grid.value === 1 ? 0x383020 : 0x141000
			this.container.addChild(grid.sprite)
		})
	}
}
