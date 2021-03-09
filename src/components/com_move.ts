import { Component } from 'ape-ecs'
import { Directions } from '../types'

// Move component is consumed by systems like collision or grinding, or finally transform

export default class Move extends Component {
	static typeName = 'Move'
	x: number
	y: number
	direction: Directions
	noClip: boolean
	static properties = {
		x: 0,
		y: 0,
		direction: null,
		noClip: false,
	}
}
