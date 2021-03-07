import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Player from '../components/com_player'
import { FOV } from 'rot-js'
import { Easing } from '@tweenjs/tween.js'
import { GlobalEntity } from '../types'
import { Tile } from '../level'

const FOV_RADIUS = 10

export default class FOVSystem extends System {
	private updatedTransforms!: Query
	init() {
		this.updatedTransforms = this.createQuery({
			all: [Transform, Player],
			persist: true,
		})
	}
	update(tick) {
		const { level } = this.world.getEntity(GlobalEntity.Game)!.c.game
		this.updatedTransforms.execute().forEach((entity) => {
			if (entity.c.transform._meta.updated !== tick) return
			const transform = entity.c.transform
			const fov = new FOV.PreciseShadowcasting((x, y) => {
				if (!level.data.has(x + ':' + y)) return false
				return level.data.get(x + ':' + y).value !== Tile.Wall
			})
			fov.compute(
				transform.x,
				transform.y,
				FOV_RADIUS,
				(x, y, r, visibility) => {
					if (!level.data.has(x + ':' + y)) return
					const { sprite } = level.data.get(x + ':' + y)
					sprite.alpha = Math.max(
						sprite.alpha,
						visibility * Easing.Exponential.Out((FOV_RADIUS - r) / FOV_RADIUS)
					)
				}
			)
		})
	}
}
