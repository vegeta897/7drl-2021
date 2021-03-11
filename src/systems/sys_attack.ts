import { Query, System } from 'ape-ecs'
import Attack from '../components/com_attack'
import Transform from '../components/com_transform'

export default class AttackSystem extends System {
	private attackers!: Query
	init(viewport) {
		this.attackers = this.createQuery({
			all: [Attack, Transform],
			persist: true,
		})
	}
	update(tick) {
		// const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		this.attackers.execute().forEach((entity) => {
			const { attack, transform: myTransform } = <
				{ attack: Attack; transform: Transform }
			>entity.c
			if (attack.target) {
				const targetTransform = <Transform>attack.target.c.transform
				const targetDistance =
					Math.abs(targetTransform.x - myTransform.x) +
					Math.abs(targetTransform.y - myTransform.y)
				if (targetDistance <= 1) {
					console.log(tick, entity.id, 'attacking!', attack.target.id)
				}
			}
			entity.removeComponent(attack)
		})
	}
}
