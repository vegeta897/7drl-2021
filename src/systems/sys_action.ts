import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity } from '../types'
import Move from '../components/com_move'
import { updateWorld } from '../ecs'
import Controller from '../components/com_controller'
import { moveDirectional } from '../util'

export default class ActionSystem extends System {
	update(tick) {
		const { controller } = <{ controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		if (controller.state !== ControllerState.Ready) return
		const player = this.world.getEntity(GlobalEntity.Player)!
		if (controller.direction !== null || controller.wait) {
			if (controller.direction !== null)
				player.addComponent({
					type: Move.typeName,
					key: 'move',
					...moveDirectional(controller.direction, controller.boost ? 8 : 1),
					noClip: controller.boost,
					direction: controller.direction,
				})
			controller.state = ControllerState.Processing
			updateWorld()
		}
		controller.direction = null
	}
}
