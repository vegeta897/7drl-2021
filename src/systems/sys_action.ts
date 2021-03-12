import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity, Tags } from '../types'
import Move from '../components/com_move'
import { runMainSystems } from '../core/ecs'
import Controller from '../components/com_controller'
import { addGrids, moveDirectional } from '../util'
import Game from '../components/com_game'
import Transform from '../components/com_transform'

export default class ActionSystem extends System {
	update(tick) {
		const { controller } = <{ controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		const player = this.world.getEntity(GlobalEntity.Player)!
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const game = <Game>gameEntity.c.game
		if (game.gameOver) {
			if (controller.restart) {
				gameEntity.addTag(Tags.UpdateHUD)
				game.gameOver = false
				controller.restart = false
				runMainSystems()
			}
		} else if (controller.state === ControllerState.Ready) {
			if (controller.direction !== null || controller.wait) {
				if (controller.direction !== null) {
					const moveTo = addGrids(
						<Transform>player.c.transform,
						moveDirectional(controller.direction, controller.boost ? 32 : 1)
					)
					player.addComponent({
						type: Move.typeName,
						key: 'move',
						...moveTo,
						noClip: controller.boost,
						sneak: controller.sneak,
						direction: controller.direction,
					})
				}
				controller.state = ControllerState.Processing
				runMainSystems()
			}
			controller.direction = null
		}
	}
}
