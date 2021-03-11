import { Component } from 'ape-ecs'
import { GlobalEntity } from '../types'

export default class Transform extends Component {
	static typeName = 'Transform'
	x: number
	y: number
	xOff: number
	yOff: number
	dirty: boolean
	static properties = {
		x: 0,
		y: 0,
		xOff: 0,
		yOff: 0,
		dirty: true,
	}
	preDestroy() {
		this.world
			.getEntity(GlobalEntity.Game)
			.c.game.level.entityMap.delete(this.x + ':' + this.y)
	}
}
