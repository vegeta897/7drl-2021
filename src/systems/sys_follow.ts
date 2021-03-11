import { Entity, Query, System } from 'ape-ecs'
import Follow from '../components/com_follow'
import Transform from '../components/com_transform'
import { GlobalEntity, GrindState } from '../types'
import { Level } from '../level'
import Game from '../components/com_game'
import Move from '../components/com_move'
import { diffGrids, getDirectionFromMove } from '../util'

const MAX_FOLLOW_DISTANCE = 10

export default class FollowSystem extends System {
	followers: Query
	init() {
		this.followers = this.createQuery({
			all: [Transform, Follow],
			persist: true,
		})
	}
	update(tick) {
		const game = <Game>this.world.getEntity(GlobalEntity.Game)!.c.game
		const player = <Entity>this.world.getEntity(GlobalEntity.Player)!
		// Do not follow if player is grinding
		if (player.c.grinding && player.c.grinding.state !== GrindState.End) return
		const level = <Level>game.level
		this.followers.execute().forEach((entity) => {
			const myTransform = <Transform>entity.c.transform
			const target = <Entity>entity.c.follow.target
			if (!target || !target.c.transform) return
			const targetTransform = <Transform>target.c.transform
			const targetDistance =
				Math.abs(targetTransform.x - myTransform.x) +
				Math.abs(targetTransform.y - myTransform.y)
			if (targetDistance > MAX_FOLLOW_DISTANCE || targetDistance === 0) return
			const moveTo = level.getPath(myTransform, targetTransform)[1]
			if (!moveTo) return
			const move = diffGrids(moveTo, myTransform)
			console.log(tick, entity.id, 'following')
			entity.addComponent({
				type: Move.typeName,
				key: 'move',
				...move,
				direction: getDirectionFromMove(move),
			})
		})
	}
}
