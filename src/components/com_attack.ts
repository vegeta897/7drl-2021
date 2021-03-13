import { Component, Entity, EntityRef } from 'ape-ecs'
import { Directions } from '../types'

export default class Attack extends Component {
	static typeName = 'Attack'
	target: Entity
	direction: Directions
	static properties = {
		target: EntityRef,
		direction: null,
	}
}
