import { Component } from 'ape-ecs'
import { Directions } from '../types'

export default class Controller extends Component {
	static typeName = 'Controller'
	direction: Directions | null
	static properties = {
		direction: null,
	}
}
