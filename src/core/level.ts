import * as rotJS from 'rot-js'
import { Container, Sprite } from 'pixi.js'
import { createSprite, TextureID, TILE_SIZE } from './sprites'
import MainLine from '../rail/rail'
import { GlobalSprite, Grid } from '../types'
import { RailData, Room } from '../rail/types'
import Dijkstra from 'rot-js/lib/path/dijkstra'
import { getRailTexture } from '../rail/util'
import { Entity } from 'ape-ecs'
import { Viewport } from 'pixi-viewport'

const RANDOM_SEED = true
const SEED = !RANDOM_SEED ? 2 : rotJS.RNG.getUniformInt(0, 0xffffff)

export const DEBUG_VISIBILITY = false

export enum Tile {
	Floor,
	Wall,
	Rail,
	HoldShift,
	Empty,
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
	ignoreFOV?: boolean
	revealed: number
}

export class Level {
	container = new Container()
	levelStart: Grid
	rooms: Room[]
	tiles: Map<string, TileData> = new Map()
	entityMap: Map<string, Entity> = new Map()
	constructor(viewport: Viewport) {
		rotJS.RNG.setSeed(SEED)
		viewport.addChild(this.container)
		this.createLevel()
	}
	createLevel(): void {
		console.time('Level generation')
		const mainLine = new MainLine()
		mainLine.tiles.data.forEach((tile, gridKey) =>
			this.tiles.set(gridKey, tile)
		)
		this.rooms = mainLine.rooms
		this.levelStart = mainLine.playerStart
		console.timeEnd('Level generation')
		console.time('Sprite creation')
		this.tiles.forEach((tile) => {
			let tint = 0xffffff
			let texture = TextureID.Floor
			if (tile.type === Tile.Wall) {
				texture = TextureID.Wall
				tint = 0x584563
			}
			if (tile.type === Tile.HoldShift) {
				texture = TextureID.HoldShift
				tile.ignoreFOV = true
			}
			if (tile.type !== Tile.Empty) {
				tile.sprite = createSprite(texture)
				tile.sprite.x = tile.x * TILE_SIZE
				tile.sprite.y = tile.y * TILE_SIZE
				if (!DEBUG_VISIBILITY) tile.sprite.alpha = 0
				tile.sprite.tint = tile.tint ?? tint
				if (tile.type === Tile.Rail) {
					const railSprite = createSprite(getRailTexture(tile.rail!))
					tile.sprite.addChild(railSprite)
				}
				if (tile.type === Tile.HoldShift) {
					tile.sprite.name = GlobalSprite.HoldShift
					tile.sprite.x += 32
					tile.sprite.tint = 0x34859d
					this.container.addChild(tile.sprite)
				} else {
					this.container.addChildAt(tile.sprite, 0)
				}
			}
		})
		// for (let i = 0; i < 8; i++) {
		// 	const rt = createSprite(TextureID.RailUpRightGoLeft + i)
		// 	rt.x = (firstRoom.x1 + i) * TILE_SIZE
		// 	rt.y = firstRoom.y2 * TILE_SIZE
		// 	this.container.addChild(rt)
		// }
		console.timeEnd('Sprite creation')
	}
	destroyLevel(): void {
		this.container.removeChildren()
		this.tiles.clear()
		this.entityMap.clear()
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
	getPath(
		from: Grid,
		to: Grid,
		selfEntity: Entity,
		distance: number = 1
	): Grid[] {
		const map = new Dijkstra(
			to.x,
			to.y,
			(x, y) => {
				return (
					this.isTileWalkable(x, y) &&
					(this.entityMap.get(x + ':' + y) || selfEntity) === selfEntity
				)
			},
			{ topology: 4 }
		)
		const path: Grid[] = []
		map.compute(
			from.x,
			from.y,
			(x, y) => path.length <= distance && path.push({ x, y })
		)
		return path
	}
}
