import { Component } from 'ape-ecs'

export class Move extends Component {
	static typeName = 'Move'
	x: number
	y: number
	static properties = {
		x: 0,
		y: 0,
	}
}
