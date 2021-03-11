import { Component } from 'ape-ecs'

export default class Health extends Component {
	static typeName = 'Health'
	current: number
	max: number
	static properties = {
		current: 10,
		max: 10,
	}
}
