import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity, Tags } from '../types'
import Move from '../components/com_move'
import { runMainSystems } from '../core/ecs'
import Controller from '../components/com_controller'
import { addGrids, moveDirectional } from '../util'
import Game from '../components/com_game'
import Transform from '../components/com_transform'

const DEBUG = false

export default class ActionSystem extends System {
	update(tick) {
		const { controller } = <{ controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		const player = this.world.getEntity(GlobalEntity.Player)!
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const game = <Game>gameEntity.c.game
		if (game.gameOver && !game.win) {
			if (controller.continue) {
				gameEntity.addTag(Tags.UpdateHUD)
				game.gameOver = false
				controller.continue = false
				runMainSystems()
			}
		} else if (controller.state === ControllerState.Ready) {
			if (controller.direction !== null || controller.wait) {
				if (controller.direction !== null) {
					const moveTo = addGrids(
						<Transform>player.c.transform,
						moveDirectional(
							controller.direction,
							DEBUG && controller.boost ? 8 : 1
						)
					)
					player.addComponent({
						type: Move.typeName,
						key: 'move',
						...moveTo,
						noClip: DEBUG && controller.boost,
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
