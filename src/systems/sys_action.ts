import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity, MoveGrids } from '../types'
import Move from '../components/com_move'
import { updateWorld } from '../ecs'

export default class ActionSystem extends System {
	update(tick) {
		const { controller } = this.world.getEntity(GlobalEntity.Game)!.c
		if (controller.state !== ControllerState.Ready) return
		const player = this.world.getEntity(GlobalEntity.Player)!
		const move = MoveGrids[controller.direction]
		let actionTaken = false
		if (move) {
			actionTaken = true
			player.addComponent({
				type: Move.typeName,
				key: 'move',
				...move,
				direction: controller.direction,
			})
		}
		controller.direction = null
		if (actionTaken) {
			controller.state = ControllerState.Processing
			updateWorld()
		}
	}
}
