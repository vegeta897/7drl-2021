import { Component } from 'ape-ecs'
import { Directions } from '../types'

export class Move extends Component {
	static typeName = 'Move'
	x: number
	y: number
	direction: Directions
	static properties = {
		x: 0,
		y: 0,
		direction: null,
	}
}
