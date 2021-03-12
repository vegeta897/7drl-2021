import { Entity, World } from 'ape-ecs'
import Transform from '../components/com_transform'
import { createSprite, TextureID } from '../core/sprites'
import Controller from '../components/com_controller'
import PixiObject from '../components/com_pixi'
import { Directions, GlobalEntity, Tags } from '../types'
import Health from '../components/com_health'
import Game from '../components/com_game'
import Grinding from '../components/com_grinding'

export function createPlayer(world: World): Entity {
	const sprite = createSprite(TextureID.Player)
	const game = <Game>world.getEntity(GlobalEntity.Game)!.c.game
	game.entityContainer.addChild(sprite)
	const grid = game.level.levelStart
	const entity = world.createEntity({
		id: GlobalEntity.Player,
		tags: [
			Tags.Player,
			Tags.UpdateHUD,
			Tags.UpdateCamera,
			Tags.UpdateVisibility,
		],
		c: {
			transform: {
				type: Transform.typeName,
				...grid,
			},
			pixi: {
				type: PixiObject.typeName,
				object: sprite,
			},
			controller: {
				type: Controller.typeName,
			},
			health: {
				type: Health.typeName,
				current: 15,
				max: 15,
			},
		},
	})
	if (game.levelNumber > 1) {
		entity.addComponent({
			type: Grinding.typeName,
			key: 'grinding',
			direction: Directions.Left,
			speed: 10,
			boosted: true,
		})
	}
	game.level.entityMap.set(grid.x + ':' + grid.y, entity)
	return entity
}
