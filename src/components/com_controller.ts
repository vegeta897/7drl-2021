import { Component } from 'ape-ecs'
import { ControllerState, Directions } from '../types'

export default class Controller extends Component {
	static typeName = 'Controller'
	direction: Directions | null
	wait: boolean
	continue: boolean
	boost: boolean // Debug movement
	sneak: boolean
	state: ControllerState
	static properties = {
		direction: null,
		wait: false,
		continue: false,
		boost: false,
		sneak: false,
		state: ControllerState.Ready,
	}
}
