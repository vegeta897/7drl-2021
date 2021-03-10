import { Component, Entity, EntityRef } from 'ape-ecs'

export default class Attack extends Component {
	static typeName = 'Attack'
	target: Entity
	static properties = {
		target: EntityRef,
	}
}
