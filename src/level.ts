import * as rotJS from 'rot-js'
import { Container, Sprite } from 'pixi.js'
import { createSprite, TextureID } from './sprites'
import { TILE_SIZE } from './'
import { createMainline } from './rail/rail'
import { Grid } from './types'
import { RailData, Room } from './rail/types'
import Dijkstra from 'rot-js/lib/path/dijkstra'
import { getSpriteProperties } from './rail/util'
import { Entity } from 'ape-ecs'

const RANDOM_SEED = true
const SEED = !RANDOM_SEED ? 2 : rotJS.RNG.getUniformInt(0, 0xffffff)
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
	solid: boolean
	rail?: RailData
	tint?: number
	revealed: number
}

export class Level {
	container = new Container()
	levelStart: Grid
	rooms: Room[]
	tiles: Map<string, TileData> = new Map()
	entityMap: Map<string, Entity> = new Map()
	private dijkstraMaps: Map<string, Dijkstra> = new Map()
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
				const railSpriteProps = getSpriteProperties(tile.rail!)
				texture = railSpriteProps.texture
				tint = railSpriteProps.tint
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
	isTileSeeThrough(x: number, y: number): boolean {
		const tile = this.getTileAt({ x, y })
		return !tile || tile.seeThrough
	}
	isTileWalkable(x: number, y: number): boolean {
		const tile = this.getTileAt({ x, y })
		return !!tile && !tile.solid
	}
	getPath(from: Grid, to: Grid, distance: number = 1): Grid[] {
		const toGridKey = to.x + ':' + to.y
		let map = this.dijkstraMaps.get(toGridKey)
		if (!map) {
			map = new Dijkstra(to.x, to.y, (x, y) => this.isTileWalkable(x, y), {
				topology: 4,
			})
			this.dijkstraMaps.set(toGridKey, map)
		}
		const path: Grid[] = []
		map.compute(
			from.x,
			from.y,
			(x, y) => path.length <= distance && path.push({ x, y })
		)
		return path
	}
}
