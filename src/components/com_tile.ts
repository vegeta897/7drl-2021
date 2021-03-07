import { Component } from 'ape-ecs'

export default class Tile extends Component {
	static typeName = 'Tile'
	x!: number
	y!: number
	static properties = {
		x: 0,
		y: 0,
	}
}
