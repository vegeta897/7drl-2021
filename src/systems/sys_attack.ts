import { Query, System } from 'ape-ecs'
import Attack from '../components/com_attack'
import Transform from '../components/com_transform'
import { GlobalEntity, Tags } from '../types'
import Game from '../components/com_game'

export default class AttackSystem extends System {
	private attackers!: Query
	init(viewport) {
		this.attackers = this.createQuery({
			all: [Attack, Transform],
			not: [Tags.Player],
			persist: true,
		})
	}
	update(tick) {
		const player = this.world.getEntity(GlobalEntity.Player)!
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		// const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		const attackers = [...this.attackers.execute()]
		if (player.has(Attack)) attackers.unshift(player)
		attackers.forEach((entity) => {
			if (entity.destroyed) return
			const { attack, transform: myTransform } = <
				{ attack: Attack; transform: Transform }
			>entity.c
			const { target } = attack
			if (target && !target.c.grinding) {
				// TODO: Swing graphic!
				const targetTransform = <Transform>target.c.transform
				const targetDistance =
					Math.abs(targetTransform.x - myTransform.x) +
					Math.abs(targetTransform.y - myTransform.y)
				if (targetDistance <= 1) {
					if (target.c.health) {
						target.c.health.current--
						target.c.health.update()
						if (target === player) {
							player.addTag(Tags.UpdateHUD)
						}
						if (target.c.health.current <= 0) {
							if (target !== player) {
								target.destroy()
								// TODO: Particles!
							} else {
								// Game over man
								game.gameOver = true
							}
						}
					}
				} else {
					// Miss
				}
			}
			entity.removeComponent(attack)
		})
	}
}
