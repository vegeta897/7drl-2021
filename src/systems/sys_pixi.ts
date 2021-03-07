import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { tileToSpritePosition } from '../util'

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
			const { transform, pixi } = entity.c
			if (!transform.dirty) return
			transform.dirty = false
			const spritePosition = tileToSpritePosition(transform)
			const spriteOffset = tileToSpritePosition({
				x: transform.xOff,
				y: transform.yOff,
			})
			Object.assign(pixi.object.position, spritePosition)
			Object.assign(pixi.object.pivot, spriteOffset)
		})
	}
}
