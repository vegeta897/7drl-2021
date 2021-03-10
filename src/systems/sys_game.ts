import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity } from '../types'
import { updateWorld } from '../ecs'
import Controller from '../components/com_controller'
import Game from '../components/com_game'

export default class GameSystem extends System {
	update(tick) {
		const { game, controller } = <{ game: Game; controller: Controller }>(
			this.world.getEntity(GlobalEntity.Game)!.c
		)
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
