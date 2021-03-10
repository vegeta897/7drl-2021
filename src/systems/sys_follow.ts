import { Entity, Query, System } from 'ape-ecs'
import Follow from '../components/com_follow'
import Transform from '../components/com_transform'
import { GlobalEntity } from '../types'

const MAX_FOLLOW_DISTANCE = 10

export default class FollowSystem extends System {
	followers: Query
	init() {
		this.followers = this.createQuery({
			all: [Transform, Follow],
			persist: true,
		})
	}
	update() {
		// Do not follow if game is auto-updating (e.g. when grinding)
		if (this.world.getEntity(GlobalEntity.Game)!.c.game.autoUpdate) return
		this.followers.execute().forEach((entity) => {
			const myTransform = <Transform>entity.c.transform
			const target = <Entity>entity.c.follow.target
			if (!target || !target.c.transform) return
			const targetTransform = <Transform>target.c.transform
			const minDistance = Math.max(
				Math.abs(targetTransform.x - myTransform.x),
				Math.abs(targetTransform.y - myTransform.y)
			)
			if (minDistance > MAX_FOLLOW_DISTANCE) return
			console.log(entity.id, 'trying to follow')
		})
	}
}
