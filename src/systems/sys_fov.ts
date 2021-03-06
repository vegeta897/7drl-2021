import { Query, System } from 'ape-ecs'
import { Tile } from '../components/com_tile'
import { Player } from '../components/com_player'
import { FOV } from 'rot-js'
import { Easing } from '@tweenjs/tween.js'
import { Entities } from '../types'

const FOV_RADIUS = 10

export default class FOVSystem extends System {
	private tilesUpdated!: Query
	init() {
		this.tilesUpdated = this.createQuery({
			all: [Tile, Player],
			persist: true,
		})
	}
	update(tick: number) {
		this.tilesUpdated.execute().forEach((entity) => {
			if (entity.c.tile._meta.updated !== tick) return
			const tile = entity.c.tile
			const level = this.world.getEntity(Entities.Level)!.c.level
			const fov = new FOV.PreciseShadowcasting((x, y) => {
				if (!level.level.data.has(x + ':' + y)) return false
				return level.level.data.get(x + ':' + y).value === 0
			})
			fov.compute(tile.x, tile.y, FOV_RADIUS, (x, y, r, visibility) => {
				if (!level.level.data.has(x + ':' + y)) return
				const { sprite } = level.level.data.get(x + ':' + y)
				sprite.alpha = Math.max(
					sprite.alpha,
					visibility * Easing.Exponential.Out((FOV_RADIUS - r) / FOV_RADIUS)
				)
				// console.log(x, y, 'visible')
			})
		})
	}
}
