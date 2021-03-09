import { Component } from 'ape-ecs'
import { ControllerState, Directions } from '../types'

export default class Controller extends Component {
	static typeName = 'Controller'
	direction: Directions | null
	boost: boolean // Debug movement
	state: ControllerState
	static properties = {
		direction: null,
		boost: false,
		state: ControllerState.Ready,
	}
}
