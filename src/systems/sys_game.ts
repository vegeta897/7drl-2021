import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity } from '../types'
import { updateWorld } from '../ecs'

export default class GameSystem extends System {
	update(tick) {
		const { game, controller } = this.world.getEntity(GlobalEntity.Game)!.c
		if (game.wait) {
			// Waiting for tweens to finish
		} else {
			this.world.tick()
			if (game.autoUpdate) {
				game.autoUpdate = false
				updateWorld()
			} else {
				// Wait for input
				controller.state = ControllerState.Ready
			}
		}
	}
}
