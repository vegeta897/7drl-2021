import { System } from 'ape-ecs'
import { ControllerState, GlobalEntity, Tags } from '../types'
import Game from '../components/com_game'
import { createPlayer } from '../archetypes/player'
import { spawnEnemies } from '../archetypes/enemy'
import { world } from '../core/ecs'
import TWEEN from '@tweenjs/tween.js'
import Controller from '../components/com_controller'

export default class GameSystem extends System {
	update(tick) {
		const gameEntity = this.world.getEntity(GlobalEntity.Game)!
		const game = <Game>gameEntity.c.game
		const controller = <Controller>gameEntity.c.controller
		if (game.gameOver) {
			game.autoUpdate = false
			TWEEN.getAll().forEach((t) => t.stop())
			this.world.entities.forEach((entity) => {
				if (entity !== gameEntity) entity.destroy()
			})
			game.level.destroyLevel()
			gameEntity.addTag(Tags.UpdateHUD)
			if (game.win) return
			game.level.createLevel()
			createPlayer(this.world)
			spawnEnemies(world)
			gameEntity.addTag(Tags.UpdateHUD)
			gameEntity.addTag(Tags.UpdateVisibility)
			controller.state = ControllerState.Ready
		}
	}
}
