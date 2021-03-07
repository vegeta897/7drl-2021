import { Component } from 'ape-ecs'
import { ControllerState, Directions } from '../types'

export default class Controller extends Component {
	static typeName = 'Controller'
	direction: Directions | null
	state: ControllerState
	static properties = {
		direction: null,
		state: ControllerState.Ready,
	}
}
