import { Container } from 'pixi.js'
import { GlobalEntity, Grid } from '../types'
import { IComponentConfigValObject, World } from 'ape-ecs'
import { createSprite, TextureID } from '../core/sprites'
import { DEBUG_VISIBILITY } from '../core/level'
import Transform from '../components/com_transform'
import PixiObject from '../components/com_pixi'
import Health from '../components/com_health'
import { DummyLocations } from '../rail/tutorial'
import Game from '../components/com_game'

let dummyID = 0

export function spawnDummies(world: World): void {
	const { level, entityContainer } = <Game>(
		world.getEntity(GlobalEntity.Game)!.c.game
	)
	DummyLocations.forEach(([x, y]) => {
		const dx = x + level.levelStart.x
		const dy = y + level.levelStart.y
		const dummyComponents = createDummyComponents(entityContainer, {
			x: dx,
			y: dy,
		})
		level.entityMap.set(
			dx + ':' + dy,
			world.createEntity({
				id: `dummy${++dummyID}`,
				c: dummyComponents,
			})
		)
		entityContainer.addChild(dummyComponents.pixi.object)
	})
}

function createDummyComponents(
	container: Container,
	grid: Grid
): IComponentConfigValObject {
	const sprite = createSprite(TextureID.Dummy)
	if (!DEBUG_VISIBILITY) sprite.alpha = 0
	container.addChild(sprite)
	const health = 2
	return {
		transform: {
			type: Transform.typeName,
			...grid,
		},
		pixi: {
			type: PixiObject.typeName,
			object: sprite,
		},
		health: {
			type: Health.typeName,
			current: health,
			max: health,
		},
	}
}
