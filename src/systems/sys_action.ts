import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity, MoveGrids } from '../types'
import Move from '../components/com_move'
import { updateWorld } from '../ecs'
import Controller from '../components/com_controller'

export default class ActionSystem extends System {
	update(tick) {
		const { controller } = <{ controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
		if (controller.state !== ControllerState.Ready) return
		const player = this.world.getEntity(GlobalEntity.Player)!
		if (controller.direction) {
			const move = MoveGrids[controller.direction]
			player.addComponent({
				type: Move.typeName,
				key: 'move',
				...move,
				direction: controller.direction,
			})
			controller.state = ControllerState.Processing
			updateWorld()
		}
		controller.direction = null
	}
}
