import { Component } from 'ape-ecs'
import { Directions, GrindState } from '../types'

export default class Grinding extends Component {
	static typeName = 'Grinding'
	direction: Directions
	state: GrindState
	distance: number
	speedup: boolean
	static properties = {
		direction: null,
		state: GrindState.Start,
		distance: 0,
		speedup: false,
	}
}
