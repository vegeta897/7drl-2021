import { Query, System } from 'ape-ecs'
import { Tile } from '../components/com_tile'
import { TILE_SIZE } from '../.'
import { Tweening } from '../components/com_tweening'
import { Easing, Tween } from '@tweenjs/tween.js'
import { PixiObject } from '../components/com_pixi'
import { Grinding } from '../components/com_grinding'

export default class TileSystem extends System {
	private tilesUpdated!: Query
	init() {
		this.tilesUpdated = this.createQuery({
			all: [Tile],
			any: [PixiObject],
			persist: true,
		})
	}
	update(tick: number) {
		this.tilesUpdated.execute().forEach((entity) => {
			if (entity.c.tile._meta.updated !== tick) return
			const spriteDest = getSpritePosition(entity.c.tile)
			if (entity.c.player) {
				const tweens = entity.getComponents(Tweening.typeName)
				tweens.forEach((tweening) => tweening.tween.stop())
				const grinding = entity.has(Grinding)
				const tween = new Tween(entity.c.pixi.object.position)
					.to(spriteDest, 80)
					.easing(grinding ? Easing.Linear.None : Easing.Quadratic.InOut)
					.start()
					.onComplete(() => {
						if (tweening && entity.has(tweening.type))
							entity.removeComponent(tweening)
					})
				const tweening = entity.addComponent({
					type: Tweening.typeName,
					tween,
				})
			} else {
				Object.assign(entity.c.pixi.object, spriteDest)
			}
		})
	}
}

// function tweenSpritePosition(entity) {
// 	entity.addComponent({
// 		type: Tweening.typeName,
// 		tween: new Tween(entity.c.tile.sprite.position).to({}),
// 	})
// }

function getSpritePosition(tile) {
	return { x: tile.x * TILE_SIZE, y: tile.y * TILE_SIZE }
}
