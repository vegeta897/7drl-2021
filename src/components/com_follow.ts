import { Component, Entity, EntityRef } from 'ape-ecs'

export default class Follow extends Component {
	static typeName = 'Follow'
	target: Entity
	static properties = {
		target: EntityRef,
	}
}
