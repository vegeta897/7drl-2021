import { Query, System } from 'ape-ecs'
import Attack from '../components/com_attack'

export default class AttackSystem extends System {
	private attackers!: Query
	init(viewport) {
		this.attackers = this.createQuery({
			all: [Attack],
			persist: true,
		})
	}
	update(tick) {
		// const level = <Level>this.world.getEntity(GlobalEntity.Game)!.c.game.level
		this.attackers.execute().forEach((entity) => {
			const attack = <Attack>entity.c.attack
			console.log(tick, entity.id, 'attacking!', attack.target.id)
			entity.removeComponent(attack)
		})
	}
}
