import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import Player from '../components/com_player'
import { FOV } from 'rot-js'
import { Easing, Tween } from '@tweenjs/tween.js'
import { GlobalEntity } from '../types'
import { Level } from '../level'

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
		const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		this.updatedTransforms.execute().forEach((entity) => {
			if (entity.c.transform._meta.updated !== tick) return
			const transform = <Transform>entity.c.transform
			const fov = new FOV.PreciseShadowcasting((x, y) => {
				const tile = level.getTileAt({ x, y })
				if (!tile) return false
				return tile.seeThrough
			})
			fov.compute(
				transform.x,
				transform.y,
				FOV_RADIUS,
				(x, y, r, visibility) => {
					const tile = level.getTileAt({ x, y })
					if (!tile || !tile.sprite) return
					const newAlpha = Math.max(
						tile.sprite.alpha,
						visibility * Easing.Exponential.Out((FOV_RADIUS - r) / FOV_RADIUS)
					)
					if (tile.sprite.alpha !== newAlpha)
						new Tween(tile.sprite).to({ alpha: newAlpha }, 100).start()
				}
			)
		})
	}
}
