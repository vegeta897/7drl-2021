import { Query, System } from 'ape-ecs'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import { tileToSpritePosition } from '../util'
import Particles from '../components/com_particles'
import Grinding from '../components/com_grinding'

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
			const { transform, pixi, grinding } = <
				{ transform: Transform; pixi: PixiObject; grinding: Grinding }
			>entity.c
			if (!transform.dirty) return
			transform.dirty = false
			const spritePosition = tileToSpritePosition(transform)
			const spriteOffset = tileToSpritePosition({
				x: transform.xOff,
				y: transform.yOff,
			})
			Object.assign(pixi.object.position, spritePosition)
			Object.assign(pixi.object.pivot, spriteOffset)
			const speedup = grinding?.speedup && tick % 10 === 0
			entity.getComponents(Particles).forEach((particles) => {
				particles.emitter.updateOwnerPos(pixi.object.x, pixi.object.y)
				if (speedup) {
					grinding.speedup = false
					particles.emitter.maxParticles++
					particles.emitter.maxLifetime += 0.01
					particles.emitter.minimumSpeedMultiplier += 0.05
					particles.emitter.minStartRotation -= 0.5
					particles.emitter.maxStartRotation += 0.5
					particles.emitter.frequency *= 0.95
				}
			})
		})
	}
}
