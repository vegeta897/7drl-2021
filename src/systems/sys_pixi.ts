import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { tileToSpritePosition } from '../util'
import Particles from '../components/com_particles'

export default class PixiSystem extends System {
	private dirtyTransforms!: Query
	init() {
		this.dirtyTransforms = this.createQuery({
			all: [Transform],
			any: [PixiObject],
			persist: true,
		})
	}

	update(tick) {
		this.dirtyTransforms.execute().forEach((entity) => {
			const { transform, pixi } = <{ transform: Transform; pixi: PixiObject }>(
				entity.c
			)
			if (transform.dirty) {
				transform.dirty = false
				Object.assign(pixi.object.position, tileToSpritePosition(transform))
				Object.assign(
					pixi.object.pivot,
					tileToSpritePosition({
						x: transform.xOff,
						y: transform.yOff,
					})
				)
			}
			entity.getComponents(Particles).forEach((particles) => {
				if (pixi.object)
					particles.emitter.updateOwnerPos(pixi.object.x, pixi.object.y)
			})
		})
	}
}
